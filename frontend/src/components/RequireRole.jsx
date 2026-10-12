import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Protege uma rota: exige login e um dos perfis informados.
 * (No backend a mesma regra é aplicada de novo: o frontend só melhora a experiência.)
 */
export default function RequireRole({ perfis, children }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }
  if (!perfis.includes(usuario.perfil)) {
    return <Navigate to="/sem-permissao" replace />;
  }
  return children;
}
