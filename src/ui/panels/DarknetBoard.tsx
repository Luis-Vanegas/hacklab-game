// Panel lateral de Bandeja de Contratos (Trabajo en Nodo Seguro vs Darknet de CIPHER).
// Separa las misiones por canal ("work" y "darknet") con estilos diferenciados y muestra
// contratos disponibles, completados o bloqueados según el rango de reputación.

import { useState } from "react";
import type { Contract, ContractChannel, ReputationTier } from "@/lib/types";
import { handleTabListKeyDown } from "../a11y/keyboardTabs";
import { ReputationBadge } from "../hud/ReputationBadge";

type ChannelTab = "all" | ContractChannel;

const CHANNEL_TABS: readonly ChannelTab[] = ["all", "work", "darknet"];

export interface DarknetBoardProps {
  readonly contracts: readonly Contract[];
  readonly activeContractId?: string | null;
  readonly completedContracts: readonly string[];
  readonly playerReputation: ReputationTier;
  readonly defaultChannel?: "all" | ContractChannel;
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
  defaultChannel = "all",
  onSelectContract,
}: DarknetBoardProps) {
  const [selectedChannel, setSelectedChannel] = useState<"all" | ContractChannel>(defaultChannel);
  const playerRank = TIER_RANK[playerReputation];

  const workCount = contracts.filter((c) => c.channel === "work").length;
  const darknetCount = contracts.filter((c) => c.channel === "darknet").length;

  const visibleContracts =
    selectedChannel === "all" ? contracts : contracts.filter((c) => c.channel === selectedChannel);

  return (
    <aside className="hl-panel" aria-label="Bandeja de contratos" data-testid="darknet-board">
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">BANDEJA // OPERACIONES</h2>
        <span className="hl-badge hl-tabular">{visibleContracts.length} OPS</span>
      </div>

      <div
        role="tablist"
        aria-label="Canales de contratos"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-xs)",
          padding: "var(--space-xs) var(--space-md)",
          borderBlockEnd: "1px solid var(--color-border)",
          backgroundColor: "rgba(10, 10, 15, 0.45)",
        }}
      >
        <button
          type="button"
          role="tab"
          tabIndex={selectedChannel === "all" ? 0 : -1}
          aria-selected={selectedChannel === "all"}
          className={selectedChannel === "all" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("all")}
          onKeyDown={(e) =>
            handleTabListKeyDown(e, CHANNEL_TABS, selectedChannel, setSelectedChannel)
          }
          data-testid="channel-tab-all"
        >
          Todos ({contracts.length})
        </button>

        <button
          type="button"
          role="tab"
          tabIndex={selectedChannel === "work" ? 0 : -1}
          aria-selected={selectedChannel === "work"}
          className={selectedChannel === "work" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("work")}
          onKeyDown={(e) =>
            handleTabListKeyDown(e, CHANNEL_TABS, selectedChannel, setSelectedChannel)
          }
          data-testid="channel-tab-work"
        >
          Trabajo · Nodo Seguro ({workCount})
        </button>

        <button
          type="button"
          role="tab"
          tabIndex={selectedChannel === "darknet" ? 0 : -1}
          aria-selected={selectedChannel === "darknet"}
          className={selectedChannel === "darknet" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("darknet")}
          onKeyDown={(e) =>
            handleTabListKeyDown(e, CHANNEL_TABS, selectedChannel, setSelectedChannel)
          }
          data-testid="channel-tab-darknet"
        >
          Darknet · CIPHER ({darknetCount})
        </button>
      </div>

      <div className="hl-panel__body">
        {visibleContracts.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No hay encargos activos en este canal.
          </p>
        ) : (
          visibleContracts.map((contract) => {
            const isCompleted = completedContracts.includes(contract.id);
            const isActive = activeContractId === contract.id;
            const isLocked = TIER_RANK[contract.requiredReputation] > playerRank;
            const isWork = contract.channel === "work";

            return (
              <article
                key={contract.id}
                className={isWork ? "hl-channel-card--work" : "hl-channel-card--darknet"}
                style={{
                  borderColor: isActive
                    ? "var(--color-accent)"
                    : isCompleted
                      ? "rgba(0, 255, 65, 0.45)"
                      : undefined,
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                  opacity: isLocked ? 0.85 : 1,
                }}
                data-testid={`contract-card-${contract.id}`}
                data-channel={contract.channel}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-xs)",
                  }}
                >
                  <span
                    className={isWork ? "hl-badge hl-badge--accent" : "hl-badge hl-badge--primary"}
                  >
                    {isWork ? "NODO SEGURO // TICKET" : "DARKNET // CIPHER"}
                  </span>

                  {isCompleted ? (
                    <span className="hl-badge hl-badge--primary">COMPLETADO</span>
                  ) : isActive ? (
                    <span className="hl-badge hl-badge--accent">ACTIVO</span>
                  ) : isLocked ? (
                    <span className="hl-badge hl-badge--warning">BLOQUEADO</span>
                  ) : null}
                </div>

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
                    aria-label={
                      isActive
                        ? `En curso: ${contract.title}`
                        : isLocked
                          ? `Rango insuficiente para ${contract.title}`
                          : `Aceptar contrato ${contract.title}`
                    }
                    onClick={() => onSelectContract(contract.id)}
                  >
                    {isActive ? "En curso" : isLocked ? "Rango insuficiente" : "Aceptar contrato"}
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
