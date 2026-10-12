import { Link } from "react-router-dom";
import useTitulo from "../hooks/useTitulo.js";

export default function SemPermissao() {
  useTitulo("Acesso negado");
  return (
    <section className="cartao cartao--estreito">
      <h1>Acesso negado</h1>
      <p>Seu perfil não tem permissão para acessar esta página.</p>
      <Link to="/" className="btn btn--primario">Voltar ao início</Link>
    </section>
  );
}
