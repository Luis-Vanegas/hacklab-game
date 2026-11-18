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
      <aside className="hl-panel" aria-label="Contract Status" data-testid="status-panel">
        <div className="hl-panel__header">
          <h2 className="hl-panel__title">MISSION STATUS</h2>
          <span className="hl-badge">IDLE</span>
        </div>
        <div className="hl-panel__body">
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No active contract selected. Choose an operation from the Darknet Board to deploy.
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
    <aside className="hl-panel" aria-label="Contract Status" data-testid="status-panel">
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">MISSION STATUS</h2>
        <span className="hl-badge hl-badge--accent hl-tabular">
          {completedCount}/{totalCount} OBJ
        </span>
      </div>

      <div className="hl-panel__body">
        <section aria-label="Target Server Details">
          <h3
            style={{
              margin: "0 0 var(--space-xs) 0",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent)",
            }}
          >
            TARGET // {activeContract.target.hostname}
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
            <span>{isConnectedToTarget ? "LINK ACTIVE" : "DISCONNECTED"}</span>
          </div>
        </section>

        <section aria-label="Contract Objectives">
          <h3
            style={{
              margin: "0 0 var(--space-xs) 0",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
          >
            OBJECTIVES
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
                <span className="hl-tabular" aria-hidden="true">
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
              Submit Contract
            </button>
          ) : null}
          {onAbandonContract ? (
            <button type="button" className="hl-btn hl-btn--danger" onClick={onAbandonContract}>
              Abort
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
