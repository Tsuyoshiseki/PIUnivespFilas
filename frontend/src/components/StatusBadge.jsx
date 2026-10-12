const ROTULOS = {
  AGUARDANDO: "Aguardando",
  CHAMADO: "Chamado",
  EM_ATENDIMENTO: "Em atendimento",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

/** O estado sempre aparece em TEXTO; a cor é só reforço (acessibilidade). */
export default function StatusBadge({ status }) {
  return (
    <span className={`selo selo--${status.toLowerCase()}`}>
      {ROTULOS[status] ?? status}
    </span>
  );
}
