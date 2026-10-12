import { useAuth } from "../context/AuthContext.jsx";
import useTitulo from "../hooks/useTitulo.js";

export default function PainelAdmin() {
  useTitulo("Painel administrativo");
  const { usuario } = useAuth();
  return (
    <section className="cartao" aria-labelledby="titulo-admin">
      <h1 id="titulo-admin">Painel administrativo</h1>
      <p>Olá, {usuario.nome}!</p>
      <p className="aviso aviso--info">
        Esta tela será construída na Fase 13: atendentes, tipos de atendimento,
        filas, histórico e indicadores.
      </p>
    </section>
  );
}
