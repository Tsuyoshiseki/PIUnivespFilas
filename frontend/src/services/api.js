// Cliente HTTP único da aplicação. Todas as chamadas à API passam por aqui.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiGet(caminho) {
  const resposta = await fetch(`${API_URL}${caminho}`);
  if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
  return resposta.json();
}
