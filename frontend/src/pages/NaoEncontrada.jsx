import { Link } from "react-router-dom";
import useTitulo from "../hooks/useTitulo.js";

export default function NaoEncontrada() {
  useTitulo("Página não encontrada");
  return (
    <section className="cartao cartao--estreito">
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <Link to="/" className="btn btn--primario">Voltar ao início</Link>
    </section>
  );
}
