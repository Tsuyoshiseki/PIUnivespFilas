import { useEffect } from "react";

/** Atualiza o título da aba. Leitores de tela anunciam o título ao mudar de página. */
export default function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} – Fila Virtual` : "Fila Virtual";
  }, [titulo]);
}
