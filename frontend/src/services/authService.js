/*
 * AUTENTICAÇÃO (SIMULADA) - SERÁ SUBSTITUÍDA NA FASE 10
 * ----------------------------------------------------
 * Contas fixas só para demonstrar as rotas protegidas. Na Fase 10 este arquivo
 * passa a chamar POST /auth/login e a guardar o token JWT; credenciais NUNCA
 * devem ficar no código do frontend em um sistema real.
 */
const USUARIOS_DEMO = [
  { nome: "Administrador", email: "admin@fila.local", senha: "admin123", perfil: "ADMIN" },
  { nome: "Atendente Demo", email: "atendente@fila.local", senha: "atendente123", perfil: "ATENDENTE" },
];

const esperar = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function entrar(email, senha) {
  await esperar();
  const u = USUARIOS_DEMO.find(
    (x) => x.email === email.trim().toLowerCase() && x.senha === senha
  );
  if (!u) throw new Error("E-mail ou senha incorretos.");
  return { nome: u.nome, email: u.email, perfil: u.perfil };
}
