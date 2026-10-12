import { useAuth } from "../context/AuthContext.jsx";
import useTitulo from "../hooks/useTitulo.js";

export default function PainelAtendente() {
  useTitulo("Painel do atendente");
  const { usuario } = useAuth();
  return (
    <section className="cartao" aria-labelledby="titulo-atendente">
      <h1 id="titulo-atendente">Painel do atendente</h1>
      <p>Olá, {usuario.nome}!</p>
      <p className="aviso aviso--info">
        Esta tela será construída na Fase 12: fila atual, chamar próximo, iniciar,
        finalizar e cancelar chamada.
      </p>
    </section>
  );
}
