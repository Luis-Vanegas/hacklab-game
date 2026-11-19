// Panel lateral de estado del contrato activo.
// Muestra el servidor objetivo, progreso de objetivos y controles de entrega o abandono.

import type { Contract } from "@/lib/types";

export interface StatusPanelProps {
  readonly activeContract: Contract | null;
  readonly connectedTo?: string | null;
  readonly onSubmitContract?: () => void;
  readonly onAbandonContract?: () => void;
}

export function StatusPanel({
  activeContract,
  connectedTo = null,
  onSubmitContract,
  onAbandonContract,
}: StatusPanelProps) {
  if (!activeContract) {
    return (
      <aside className="hl-panel" aria-label="Estado de la misión" data-testid="status-panel">
        <div className="hl-panel__header">
          <h2 className="hl-panel__title">ESTADO DE MISIÓN</h2>
          <span className="hl-badge">SIN MISIÓN</span>
        </div>
        <div className="hl-panel__body">
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No hay ningún contrato activo. Elige una misión en el tablero de contratos para
            comenzar.
          </p>
        </div>
      </aside>
    );
  }

  const completedCount = activeContract.objectives.filter((obj) => obj.completed).length;
  const totalCount = activeContract.objectives.length;
  const isConnectedToTarget =
    connectedTo === activeContract.target.ip || connectedTo === activeContract.target.hostname;

  return (
    <aside className="hl-panel" aria-label="Estado de la misión" data-testid="status-panel">
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">ESTADO DE MISIÓN</h2>
        <span className="hl-badge hl-badge--accent hl-tabular">
          {completedCount}/{totalCount} OBJ
        </span>
      </div>

      <div className="hl-panel__body">
        <section aria-label="Detalles del servidor objetivo">
          <h3
            style={{
              margin: "0 0 var(--space-xs) 0",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent)",
            }}
          >
            OBJETIVO // {activeContract.target.hostname}
          </h3>
          <div
            className="hl-tabular"
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>IP: {activeContract.target.ip}</span>
            <span>{isConnectedToTarget ? "ENLACE ACTIVO" : "DESCONECTADO"}</span>
          </div>
        </section>

        <section aria-label="Objetivos del contrato">
          <h3
            style={{
              margin: "0 0 var(--space-xs) 0",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
          >
            OBJETIVOS
          </h3>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            {activeContract.objectives.map((objective) => (
              <li
                key={objective.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-sm)",
                  fontSize: "0.84rem",
                  color: objective.completed ? "var(--color-primary)" : "var(--color-text)",
                }}
                data-testid={`objective-${objective.id}`}
              >
                <span
                  className="hl-tabular"
                  aria-hidden="true"
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {objective.completed ? "[x]" : "[ ]"}
                </span>
                <span
                  style={{
                    textDecoration: objective.completed ? "line-through" : "none",
                    opacity: objective.completed ? 0.85 : 1,
                  }}
                >
                  {objective.description}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div
          style={{
            marginBlockStart: "auto",
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
          }}
        >
          {onSubmitContract ? (
            <button
              type="button"
              className="hl-btn hl-btn--primary"
              disabled={completedCount === 0}
              onClick={onSubmitContract}
            >
              Entregar contrato
            </button>
          ) : null}
          {onAbandonContract ? (
            <button type="button" className="hl-btn hl-btn--danger" onClick={onAbandonContract}>
              Abandonar
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
