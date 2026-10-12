import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import useTitulo from "../hooks/useTitulo.js";
import {
  consultarSenha,
  esquecerUltimaSenha,
  sairDaFila,
} from "../services/filaService.js";

const INTERVALO_MS = 5000; // atualização automática (polling) a cada 5 segundos
const STATUS_FINAIS = ["FINALIZADO", "CANCELADO"];

function mensagemPrincipal(d) {
  switch (d.status) {
    case "AGUARDANDO": {
      if (d.pessoas_a_frente === 0) return "Você é o próximo!";
      const quem =
        d.pessoas_a_frente === 1 ? "Há 1 pessoa" : `Há ${d.pessoas_a_frente} pessoas`;
      return `Você está na posição ${d.posicao}. ${quem} à sua frente.`;
    }
    case "CHAMADO":
      return "É sua vez! Dirija-se ao atendimento.";
    case "EM_ATENDIMENTO":
      return "Você está sendo atendido(a).";
    case "FINALIZADO":
      return "Atendimento finalizado. Obrigado!";
    default:
      return "Você saiu da fila.";
  }
}

export default function MinhaSenha() {
  const { codigo } = useParams();
  const [dados, setDados] = useState(null);
  const [problema, setProblema] = useState(null); // "nao-encontrada" | "rede"
  const [confirmando, setConfirmando] = useState(false);
  const [erroSaida, setErroSaida] = useState("");

  useTitulo(
    dados ? (dados.status === "CHAMADO" ? "É sua vez!" : `Senha ${dados.codigo_senha}`) : "Minha senha"
  );

  // Consulta a posição e agenda a próxima consulta (uma de cada vez, sem sobreposição).
  useEffect(() => {
    let ativo = true;
    let timer;

    async function carregar() {
      try {
        const d = await consultarSenha(codigo);
        if (!ativo) return;
        setDados(d);
        setProblema(null);
        if (STATUS_FINAIS.includes(d.status)) {
          esquecerUltimaSenha(codigo);
        } else {
          timer = setTimeout(carregar, INTERVALO_MS);
        }
      } catch (erro) {
        if (!ativo) return;
        if (erro.message === "NAO_ENCONTRADA") {
          setProblema("nao-encontrada");
        } else {
          setProblema("rede");
          timer = setTimeout(carregar, INTERVALO_MS);
        }
      }
    }

    carregar();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [codigo]);

  async function sair() {
    setErroSaida("");
    try {
      await sairDaFila(codigo);
      setConfirmando(false);
      setDados(await consultarSenha(codigo));
      esquecerUltimaSenha(codigo);
    } catch {
      setErroSaida("Não foi possível sair da fila agora. Tente novamente.");
    }
  }

  if (problema === "nao-encontrada") {
    return (
      <section className="cartao cartao--estreito">
        <h1>Senha não encontrada</h1>
        <p>Este endereço não corresponde a nenhuma senha ativa.</p>
        <Link to="/entrar" className="btn btn--primario">Entrar na fila</Link>
      </section>
    );
  }

  if (!dados) {
    return (
      <p role="status" className="texto-suave">
        {problema === "rede" ? "Sem conexão. Tentando novamente…" : "Carregando sua senha…"}
      </p>
    );
  }

  const chamado = dados.status === "CHAMADO";

  return (
    <section className="cartao cartao--estreito" aria-labelledby="titulo-senha">
      <h1 id="titulo-senha">Olá, {dados.nome_cliente}!</h1>

      <div className="senha">
        <span className="senha__rotulo">Sua senha</span>
        <span className="senha__codigo">{dados.codigo_senha}</span>
        <span className="texto-suave">
          {dados.tipo_nome}
          {dados.preferencial ? " · Preferencial" : ""}
        </span>
        <StatusBadge status={dados.status} />
      </div>

      {/* Região "viva": leitores de tela anunciam quando o texto muda. */}
      <div
        className={chamado ? "anuncio anuncio--vez" : "anuncio"}
        role={chamado ? "alert" : "status"}
        aria-live={chamado ? "assertive" : "polite"}
      >
        {mensagemPrincipal(dados)}
      </div>

      {problema === "rede" && (
        <p className="aviso aviso--info" role="status">
          Sem conexão. Tentando atualizar novamente…
        </p>
      )}

      {dados.status === "AGUARDANDO" && (
        <dl className="numeros">
          <div>
            <dt>Posição</dt>
            <dd>{dados.posicao}º</dd>
          </div>
          <div>
            <dt>À sua frente</dt>
            <dd>{dados.pessoas_a_frente}</dd>
          </div>
          <div>
            <dt>Tempo estimado</dt>
            <dd>
              {dados.tempo_estimado_minutos === 0
                ? "menos de 1 min"
                : `~${dados.tempo_estimado_minutos} min`}
            </dd>
          </div>
        </dl>
      )}

      {dados.status === "AGUARDANDO" && (
        <div className="saida">
          {!confirmando ? (
            <button type="button" className="btn btn--perigo-suave" onClick={() => setConfirmando(true)}>
              Sair da fila
            </button>
          ) : (
            <div role="group" aria-label="Confirmar saída da fila">
              <p><strong>Tem certeza?</strong> Você perderá seu lugar na fila.</p>
              <div className="acoes">
                <button type="button" className="btn btn--perigo" onClick={sair}>
                  Sim, sair da fila
                </button>
                <button type="button" className="btn btn--secundario" onClick={() => setConfirmando(false)}>
                  Continuar na fila
                </button>
              </div>
            </div>
          )}
          {erroSaida && <p className="aviso aviso--erro" role="alert">{erroSaida}</p>}
        </div>
      )}

      {STATUS_FINAIS.includes(dados.status) && (
        <Link to="/entrar" className="btn btn--primario">Entrar em uma nova fila</Link>
      )}

      <p className="campo__dica">
        Guarde o endereço desta página para acompanhar sua senha de outro dispositivo.
      </p>
    </section>
  );
}
