import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitulo from "../hooks/useTitulo.js";
import { entrarNaFila, listarTipos } from "../services/filaService.js";

const limparNome = (texto) => texto.trim().replace(/\s+/g, " ");

export default function EntrarNaFila() {
  useTitulo("Entrar na fila");
  const navigate = useNavigate();

  const [tipos, setTipos] = useState(null);
  const [falhaCarga, setFalhaCarga] = useState(false);
  const [nome, setNome] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [preferencial, setPreferencial] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarTipos()
      .then((lista) => ativo && setTipos(lista))
      .catch(() => ativo && setFalhaCarga(true));
    return () => {
      ativo = false;
    };
  }, []);

  const tipoSelecionado = tipos?.find((t) => String(t.id) === tipoId);

  function trocarTipo(valor) {
    setTipoId(valor);
    setPreferencial(false); // RN10: preferencial só vale se o novo tipo permitir
  }

  function validar() {
    const e = {};
    const n = limparNome(nome);
    if (n.length < 2) e.nome = "Informe seu nome (mínimo de 2 letras).";
    else if (n.length > 60) e.nome = "O nome pode ter no máximo 60 caracteres.";
    if (!tipoId) e.tipo = "Escolha o tipo de atendimento.";
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral("");

    const e = validar();
    setErros(e);
    if (e.nome) return document.getElementById("campo-nome")?.focus();
    if (e.tipo) return document.getElementById("campo-tipo")?.focus();

    setEnviando(true);
    try {
      const senha = await entrarNaFila({
        nome: limparNome(nome),
        tipo_atendimento_id: Number(tipoId),
        preferencial,
      });
      navigate(`/senha/${senha.codigo_acesso}`);
    } catch (err) {
      setErroGeral(err.message || "Não foi possível entrar na fila. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <section className="cartao cartao--estreito" aria-labelledby="titulo-entrar">
      <h1 id="titulo-entrar">Entrar na fila</h1>
      <p className="texto-suave">Informe seu nome e escolha o atendimento desejado.</p>

      {falhaCarga && (
        <p className="aviso aviso--erro" role="alert">
          Não foi possível carregar os tipos de atendimento. Recarregue a página.
        </p>
      )}
      {!tipos && !falhaCarga && (
        <p role="status" className="texto-suave">Carregando tipos de atendimento…</p>
      )}

      {tipos && (
        <form onSubmit={enviar} noValidate>
          {erroGeral && (
            <p className="aviso aviso--erro" role="alert">{erroGeral}</p>
          )}

          <div className="campo">
            <label htmlFor="campo-nome">Seu nome</label>
            <input
              id="campo-nome"
              type="text"
              autoComplete="given-name"
              maxLength={80}
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={erros.nome ? "true" : undefined}
              aria-describedby={erros.nome ? "erro-nome" : undefined}
            />
            {erros.nome && <p id="erro-nome" className="campo__erro">{erros.nome}</p>}
          </div>

          <div className="campo">
            <label htmlFor="campo-tipo">Tipo de atendimento</label>
            <select
              id="campo-tipo"
              required
              value={tipoId}
              onChange={(e) => trocarTipo(e.target.value)}
              aria-invalid={erros.tipo ? "true" : undefined}
              aria-describedby={erros.tipo ? "erro-tipo" : undefined}
            >
              <option value="">Selecione…</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            {erros.tipo && <p id="erro-tipo" className="campo__erro">{erros.tipo}</p>}
          </div>

          {tipoSelecionado?.permite_preferencial && (
            <div className="campo campo--check">
              <input
                id="campo-preferencial"
                type="checkbox"
                checked={preferencial}
                onChange={(e) => setPreferencial(e.target.checked)}
                aria-describedby="dica-preferencial"
              />
              <label htmlFor="campo-preferencial">Atendimento preferencial</label>
              <p id="dica-preferencial" className="campo__dica">
                Para idosos, gestantes, pessoas com deficiência e outros casos
                previstos em lei. A condição será confirmada no atendimento.
              </p>
            </div>
          )}

          <button type="submit" className="btn btn--primario btn--bloco" disabled={enviando}>
            {enviando ? "Entrando na fila…" : "Entrar na fila"}
          </button>
        </form>
      )}
    </section>
  );
}
