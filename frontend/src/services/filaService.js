/*
 * SERVIÇO DA FILA (SIMULADO)
 * --------------------------
 * Enquanto o backend não expõe as rotas (Fases 10-11), este arquivo simula a API
 * guardando os dados no localStorage do navegador.
 *
 * As funções e os campos (snake_case) seguem o contrato planejado para a API real:
 *   GET    /tipos-atendimento        -> listarTipos()
 *   POST   /filas/entrar             -> entrarNaFila()
 *   GET    /senhas/{codigo_acesso}   -> consultarSenha()
 *   DELETE /senhas/{codigo_acesso}   -> sairDaFila()
 * Na Fase 11 basta reescrever este arquivo usando apiGet/apiPost; as páginas não mudam.
 */
const CHAVE_SENHAS = "fv_mock_senhas";
const CHAVE_ULTIMA = "fv_ultima_senha";
const PASSO_MS = 8000; // a cada 8 s a fila "anda" uma posição (só para demonstração)
const MINUTOS_POR_PESSOA = 5;

const TIPOS = [
  { id: 1, nome: "Atendimento Geral", prefixo_senha: "A", permite_preferencial: true },
  { id: 2, nome: "Retirada de Documentos", prefixo_senha: "R", permite_preferencial: false },
  { id: 3, nome: "Informações", prefixo_senha: "I", permite_preferencial: false },
];

const esperar = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function lerSenhas() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SENHAS)) || {};
  } catch {
    return {};
  }
}

function gravarSenhas(senhas) {
  localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));
}

function novoCodigo() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });
}

export async function listarTipos() {
  await esperar();
  return TIPOS.map((t) => ({ ...t }));
}

export async function entrarNaFila({ nome, tipo_atendimento_id, preferencial }) {
  await esperar();
  const tipo = TIPOS.find((t) => t.id === tipo_atendimento_id);
  if (!tipo) throw new Error("Tipo de atendimento inválido.");
  if (preferencial && !tipo.permite_preferencial) {
    throw new Error("Este tipo de atendimento não permite preferencial."); // RN10
  }

  const senhas = lerSenhas();
  const numeros = Object.values(senhas)
    .filter((s) => s.tipo_id === tipo.id)
    .map((s) => s.numero);
  const numero = (numeros.length ? Math.max(...numeros) : 0) + 1;

  const registro = {
    codigo_acesso: novoCodigo(),
    numero,
    codigo_senha: `${tipo.prefixo_senha}${String(numero).padStart(3, "0")}`,
    nome_cliente: nome,
    tipo_id: tipo.id,
    tipo_nome: tipo.nome,
    preferencial: Boolean(preferencial),
    a_frente_inicial: preferencial ? 1 : 4,
    entrada: Date.now(),
    cancelado: false,
  };
  senhas[registro.codigo_acesso] = registro;
  gravarSenhas(senhas);
  localStorage.setItem(CHAVE_ULTIMA, registro.codigo_acesso);
  return { codigo_acesso: registro.codigo_acesso, codigo_senha: registro.codigo_senha };
}

export async function consultarSenha(codigoAcesso) {
  await esperar(80);
  const r = lerSenhas()[codigoAcesso];
  if (!r) throw new Error("NAO_ENCONTRADA");

  const passos = Math.floor((Date.now() - r.entrada) / PASSO_MS);
  const aFrente = Math.max(0, r.a_frente_inicial - passos);

  let status = aFrente > 0 ? "AGUARDANDO" : "CHAMADO";
  if (r.cancelado) status = "CANCELADO";

  return {
    codigo_acesso: r.codigo_acesso,
    codigo_senha: r.codigo_senha,
    nome_cliente: r.nome_cliente,
    tipo_nome: r.tipo_nome,
    preferencial: r.preferencial,
    status,
    posicao: aFrente + 1,
    pessoas_a_frente: aFrente,
    tempo_estimado_minutos: aFrente * MINUTOS_POR_PESSOA,
  };
}

export async function sairDaFila(codigoAcesso) {
  await esperar();
  const senhas = lerSenhas();
  if (!senhas[codigoAcesso]) throw new Error("NAO_ENCONTRADA");
  senhas[codigoAcesso].cancelado = true;
  gravarSenhas(senhas);
}

/* Auxiliares para "lembrar" a senha do cliente neste navegador */
export function lerUltimaSenha() {
  return localStorage.getItem(CHAVE_ULTIMA);
}

export function esquecerUltimaSenha(codigoAcesso) {
  if (localStorage.getItem(CHAVE_ULTIMA) === codigoAcesso) {
    localStorage.removeItem(CHAVE_ULTIMA);
  }
}
