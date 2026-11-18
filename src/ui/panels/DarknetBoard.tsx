// Panel lateral de Darknet Board.
// Muestra contratos disponibles, completados o bloqueados según el rango de reputación del jugador.

import type { Contract, ReputationTier } from "@/lib/types";
import { ReputationBadge } from "../hud/ReputationBadge";

export interface DarknetBoardProps {
  readonly contracts: readonly Contract[];
  readonly activeContractId?: string | null;
  readonly completedContracts: readonly string[];
  readonly playerReputation: ReputationTier;
  readonly onSelectContract?: (contractId: string) => void;
}

const TIER_RANK: Record<ReputationTier, number> = {
  script_kiddie: 0,
  hacker: 1,
  elite_hacker: 2,
  l33t: 3,
  anonymous: 4,
};

export function DarknetBoard({
  contracts,
  activeContractId = null,
  completedContracts,
  playerReputation,
  onSelectContract,
}: DarknetBoardProps) {
  const playerRank = TIER_RANK[playerReputation];

  return (
    <aside className="hl-panel" aria-label="Darknet Contract Board" data-testid="darknet-board">
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">DARKNET BOARD</h2>
        <span className="hl-badge hl-tabular">{contracts.length} OPS</span>
      </div>

      <div className="hl-panel__body">
        {contracts.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No contracts broadcast on this node.
          </p>
        ) : (
          contracts.map((contract) => {
            const isCompleted = completedContracts.includes(contract.id);
            const isActive = activeContractId === contract.id;
            const isLocked = TIER_RANK[contract.requiredReputation] > playerRank;

            return (
              <article
                key={contract.id}
                style={{
                  border: `1px solid ${
                    isActive
                      ? "var(--color-accent)"
                      : isCompleted
                        ? "rgba(0, 255, 65, 0.35)"
                        : "var(--color-border-strong)"
                  }`,
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  backgroundColor: isActive
                    ? "rgba(0, 191, 255, 0.08)"
                    : "var(--color-surface-elevated)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                  opacity: isLocked ? 0.65 : 1,
                }}
                data-testid={`contract-card-${contract.id}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-xs)",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.92rem",
                      fontFamily: "var(--font-mono)",
                      color: isActive ? "var(--color-accent)" : "var(--color-text)",
                    }}
                  >
                    {contract.title}
                  </h3>
                  {isCompleted ? (
                    <span className="hl-badge hl-badge--primary">DONE</span>
                  ) : isActive ? (
                    <span className="hl-badge hl-badge--accent">ACTIVE</span>
                  ) : isLocked ? (
                    <span className="hl-badge hl-badge--warning">LOCKED</span>
                  ) : null}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {contract.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-xs)",
                  }}
                >
                  <span
                    className="hl-tabular"
                    style={{ fontSize: "0.78rem", color: "var(--color-credits)" }}
                  >
                    +{contract.reward.credits} CR / +{contract.reward.xp} XP
                  </span>
                  <ReputationBadge tier={contract.requiredReputation} />
                </div>

                {onSelectContract ? (
                  <button
                    type="button"
                    className={isActive ? "hl-btn" : "hl-btn hl-btn--primary"}
                    disabled={isLocked || isActive}
                    onClick={() => onSelectContract(contract.id)}
                  >
                    {isActive ? "In Progress" : isLocked ? "Insufficient Rank" : "Accept Contract"}
                  </button>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}
