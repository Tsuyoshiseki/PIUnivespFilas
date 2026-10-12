import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import useTitulo from "../hooks/useTitulo.js";

const PAINEL = { ADMIN: "/admin", ATENDENTE: "/atendente" };

export default function Login() {
  useTitulo("Área do funcionário");
  const { usuario, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={PAINEL[usuario.perfil]} replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    if (!email.trim() || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }
    setEnviando(true);
    try {
      const u = await entrar(email, senha);
      navigate(location.state?.de || PAINEL[u.perfil], { replace: true });
    } catch (e) {
      setErro(e.message || "Não foi possível entrar. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <section className="cartao cartao--estreito" aria-labelledby="titulo-login">
      <h1 id="titulo-login">Área do funcionário</h1>
      <p className="texto-suave">Acesso para atendentes e administradores.</p>

      <form onSubmit={enviar} noValidate>
        {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}

        <div className="campo">
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--primario btn--bloco" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      {import.meta.env.DEV && (
        <p className="aviso aviso--info">
          admin@fila.local / admin123 ·
          atendente@fila.local / atendente123
        </p>
      )}
    </section>
  );
}
