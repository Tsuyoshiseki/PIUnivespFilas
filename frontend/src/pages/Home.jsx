import { Link } from "react-router-dom";
import useTitulo from "../hooks/useTitulo.js";
import { lerUltimaSenha } from "../services/filaService.js";

export default function Home() {
  useTitulo("");
  const ultimaSenha = lerUltimaSenha();

  return (
    <>
      <section className="heroi" aria-labelledby="titulo-home">
        <h1 id="titulo-home">Fila Virtual</h1>
        <p className="heroi__texto">
          Entre na fila pelo celular, acompanhe sua posição em tempo real e
          aguarde onde preferir. Sem aglomeração e sem perder tempo.
        </p>
        <div className="acoes">
          <Link to="/entrar" className="btn btn--primario btn--grande">
            Entrar na fila
          </Link>
          <Link to="/login" className="btn btn--secundario btn--grande">
            Área do funcionário
          </Link>
        </div>
      </section>

      {ultimaSenha && (
        <aside className="aviso aviso--info" aria-label="Senha em andamento">
          Você tem uma senha neste dispositivo.{" "}
          <Link to={`/senha/${ultimaSenha}`}>Voltar para minha senha</Link>
        </aside>
      )}

      <section aria-labelledby="titulo-como">
        <h2 id="titulo-como">Como funciona</h2>
        <ol className="passos">
          <li>
            <strong>Informe seu nome</strong>
            <span>Escolha o tipo de atendimento. Não precisa de cadastro.</span>
          </li>
          <li>
            <strong>Receba sua senha</strong>
            <span>O sistema gera uma senha e mostra sua posição na fila.</span>
          </li>
          <li>
            <strong>Acompanhe e aguarde</strong>
            <span>A tela avisa quando for a sua vez de ser atendido.</span>
          </li>
        </ol>
      </section>
    </>
  );
}
