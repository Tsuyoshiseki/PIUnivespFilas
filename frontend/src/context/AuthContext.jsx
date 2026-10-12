import { createContext, useCallback, useContext, useState } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);
const CHAVE = "fv_usuario";

function lerSalvo() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSalvo);

  const entrar = useCallback(async (email, senha) => {
    const u = await authService.entrar(email, senha);
    sessionStorage.setItem(CHAVE, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const sair = useCallback(() => {
    sessionStorage.removeItem(CHAVE);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
