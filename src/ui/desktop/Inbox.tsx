// Bandeja de entrada de correos (Inbox.tsx).
// Presenta los contratos por canal ("work" de Marta Ríos / "darknet" de CIPHER) como correos.
// Es 100 % presentacional: recibe todo por props sin acceder al store Zustand.

import { useState } from "react";
import type { Contract, ContractChannel, ReputationTier } from "@/lib/types";
import { CHARACTERS, type CharacterId } from "@/store";
import { PixelPortrait } from "../guides/StoryDialog";
import { ReputationBadge } from "../hud/ReputationBadge";

export interface InboxProps {
  readonly contracts: readonly Contract[];
  readonly activeContractId?: string | null;
  readonly completedContracts: readonly string[];
  readonly playerReputation: ReputationTier;
  readonly readIds?: readonly string[];
  readonly defaultChannel?: "all" | ContractChannel;
  readonly onMarkRead?: (contractId: string) => void;
  readonly onSelectContract?: (contractId: string) => void;
}

export interface ContractSenderInfo {
  readonly key: string;
  readonly name: string;
  readonly role: string;
  readonly channel: ContractChannel;
}

const TIER_RANK: Record<ReputationTier, number> = {
  script_kiddie: 0,
  hacker: 1,
  elite_hacker: 2,
  l33t: 3,
  anonymous: 4,
};

export function resolveSenderForContract(contract: Contract): ContractSenderInfo {
  const defaultKey: CharacterId = contract.channel === "work" ? "MARTA" : "CIPHER";
  const rawKey = contract.story.intro[0]?.character ?? defaultKey;

  if (rawKey in CHARACTERS) {
    const info = CHARACTERS[rawKey as CharacterId];
    return {
      key: rawKey,
      name: info.name,
      role: info.role,
      channel: contract.channel,
    };
  }

  const fallback = CHARACTERS[defaultKey];
  return {
    key: rawKey,
    name: rawKey.trim().length > 0 ? rawKey : fallback.name,
    role: fallback.role,
    channel: contract.channel,
  };
}

export function countUnreadContracts(
  contracts: readonly Contract[],
  readIds: readonly string[],
  completedContracts: readonly string[],
  activeContractId?: string | null,
): number {
  return contracts.filter(
    (contract) =>
      !readIds.includes(contract.id) &&
      !completedContracts.includes(contract.id) &&
      contract.id !== activeContractId,
  ).length;
}

export function Inbox({
  contracts,
  activeContractId = null,
  completedContracts,
  playerReputation,
  readIds,
  defaultChannel = "all",
  onMarkRead,
  onSelectContract,
}: InboxProps) {
  const [selectedChannel, setSelectedChannel] = useState<"all" | ContractChannel>(defaultChannel);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [internalReadIds, setInternalReadIds] = useState<readonly string[]>([]);

  const effectiveReadIds = readIds ?? internalReadIds;
  const playerRank = TIER_RANK[playerReputation];

  const workCount = contracts.filter((c) => c.channel === "work").length;
  const darknetCount = contracts.filter((c) => c.channel === "darknet").length;
  const unreadCount = countUnreadContracts(
    contracts,
    effectiveReadIds,
    completedContracts,
    activeContractId,
  );

  const visibleContracts =
    selectedChannel === "all" ? contracts : contracts.filter((c) => c.channel === selectedChannel);

  const openedContract = openedId
    ? (contracts.find((contract) => contract.id === openedId) ?? null)
    : null;

  const isContractRead = (contractId: string): boolean =>
    effectiveReadIds.includes(contractId) ||
    completedContracts.includes(contractId) ||
    contractId === activeContractId;

  const handleOpenMessage = (contractId: string) => {
    setOpenedId(contractId);
    if (!effectiveReadIds.includes(contractId)) {
      if (readIds === undefined) {
        setInternalReadIds((prev) => (prev.includes(contractId) ? prev : [...prev, contractId]));
      }
      onMarkRead?.(contractId);
    }
  };

  if (openedContract) {
    const sender = resolveSenderForContract(openedContract);
    const isWork = openedContract.channel === "work";
    const isCompleted = completedContracts.includes(openedContract.id);
    const isActive = activeContractId === openedContract.id;
    const isLocked = TIER_RANK[openedContract.requiredReputation] > playerRank;
    const briefingLines =
      openedContract.story.intro.length > 0
        ? openedContract.story.intro
        : [{ character: sender.key, text: openedContract.description }];

    return (
      <aside className="hl-panel" aria-label="Detalle del correo" data-testid="inbox-detail">
        <div className="hl-panel__header">
          <button
            type="button"
            className="hl-btn"
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            onClick={() => setOpenedId(null)}
            data-testid="inbox-back-btn"
          >
            ← Volver a la bandeja
          </button>

          <span className={isWork ? "hl-badge hl-badge--accent" : "hl-badge hl-badge--primary"}>
            {isWork ? "NODO SEGURO" : "DARKNET"}
          </span>
        </div>

        <div className="hl-panel__body">
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-md)",
              paddingBlockEnd: "var(--space-sm)",
              borderBlockEnd: "1px solid var(--color-border)",
            }}
          >
            <PixelPortrait character={sender.key} size={48} />

            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minInlineSize: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  flexWrap: "wrap",
                }}
              >
                <strong
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.92rem",
                    color: isWork ? "var(--color-accent)" : "var(--color-primary)",
                  }}
                >
                  {sender.name}
                </strong>
                <span style={{ fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
                  {sender.role}
                </span>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.98rem",
                  color: "var(--color-text)",
                }}
              >
                {openedContract.title}
              </h3>
            </div>
          </header>

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
              style={{ fontSize: "0.8rem", color: "var(--color-credits)" }}
            >
              Recompensa: +{openedContract.reward.credits} CR / +{openedContract.reward.xp} XP
            </span>
            <ReputationBadge tier={openedContract.requiredReputation} />
          </div>

          <section
            aria-label="Briefing del mensaje"
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}
          >
            <h4
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
              }}
            >
              MENSAJE
            </h4>
            {briefingLines.map((line, idx) => (
              <p
                key={`${openedContract.id}-line-${idx}`}
                style={{
                  margin: 0,
                  padding: "var(--space-sm)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.85rem",
                  color: "var(--color-text)",
                }}
              >
                {line.text}
              </p>
            ))}
          </section>

          <section
            aria-label="Objetivos del contrato"
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}
          >
            <h4
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
              }}
            >
              OBJETIVOS ({openedContract.objectives.length})
            </h4>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
              }}
            >
              {openedContract.objectives.map((obj) => (
                <li
                  key={obj.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-sm)",
                    fontSize: "0.83rem",
                    color: obj.completed ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  <span className="hl-tabular" aria-hidden="true">
                    {obj.completed ? "[x]" : "[ ]"}
                  </span>
                  <span>{obj.description}</span>
                </li>
              ))}
            </ul>
          </section>

          <div
            style={{
              marginBlockStart: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-sm)",
              flexWrap: "wrap",
            }}
          >
            {isCompleted ? <span className="hl-badge hl-badge--primary">COMPLETADO</span> : null}
            {onSelectContract ? (
              <button
                type="button"
                className={isActive ? "hl-btn" : "hl-btn hl-btn--primary"}
                disabled={isLocked || isActive}
                onClick={() => onSelectContract(openedContract.id)}
                data-testid="inbox-accept-btn"
              >
                {isActive ? "En curso" : isLocked ? "Rango insuficiente" : "Aceptar"}
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hl-panel" aria-label="Bandeja de entrada" data-testid="inbox-panel">
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">BANDEJA DE ENTRADA</h2>
        <span
          className={
            unreadCount > 0 ? "hl-badge hl-badge--accent hl-tabular" : "hl-badge hl-tabular"
          }
          data-testid="inbox-unread-count"
        >
          {unreadCount > 0 ? `${unreadCount} SIN LEER` : "AL DÍA"}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Canales de correo"
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
          aria-selected={selectedChannel === "all"}
          className={selectedChannel === "all" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("all")}
          data-testid="inbox-tab-all"
        >
          Todos ({contracts.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedChannel === "work"}
          className={selectedChannel === "work" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("work")}
          data-testid="inbox-tab-work"
        >
          Trabajo · Nodo Seguro ({workCount})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedChannel === "darknet"}
          className={selectedChannel === "darknet" ? "hl-btn hl-btn--primary" : "hl-btn"}
          style={{ fontSize: "0.76rem", padding: "4px 8px" }}
          onClick={() => setSelectedChannel("darknet")}
          data-testid="inbox-tab-darknet"
        >
          Darknet · CIPHER ({darknetCount})
        </button>
      </div>

      <div className="hl-panel__body">
        {visibleContracts.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No hay correos en este canal.
          </p>
        ) : (
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
            {visibleContracts.map((contract) => {
              const sender = resolveSenderForContract(contract);
              const unread = !isContractRead(contract.id);
              const isCompleted = completedContracts.includes(contract.id);
              const isActive = activeContractId === contract.id;
              const isLocked = TIER_RANK[contract.requiredReputation] > playerRank;
              const isWork = contract.channel === "work";

              return (
                <li key={contract.id}>
                  <button
                    type="button"
                    className={`hl-inbox-item ${unread ? "hl-inbox-item--unread" : ""} ${
                      isWork ? "hl-channel-card--work" : "hl-channel-card--darknet"
                    }`}
                    onClick={() => handleOpenMessage(contract.id)}
                    data-testid={`inbox-item-${contract.id}`}
                    data-unread={unread ? "true" : "false"}
                  >
                    <PixelPortrait character={sender.key} size={32} />

                    <div
                      style={{
                        flex: "1 1 auto",
                        minInlineSize: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                        textAlign: "start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-xs)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.78rem",
                            fontWeight: unread ? 700 : 500,
                            color: isWork ? "var(--color-accent)" : "var(--color-primary)",
                          }}
                        >
                          {sender.name}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {unread ? (
                            <span
                              className="hl-badge hl-badge--accent"
                              data-testid={`inbox-new-${contract.id}`}
                            >
                              NUEVO
                            </span>
                          ) : null}
                          {isCompleted ? (
                            <span className="hl-badge hl-badge--primary">COMPLETADO</span>
                          ) : isActive ? (
                            <span className="hl-badge hl-badge--accent">ACTIVO</span>
                          ) : isLocked ? (
                            <span className="hl-badge hl-badge--warning">BLOQUEADO</span>
                          ) : null}
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.88rem",
                          fontWeight: unread ? 700 : 500,
                          color: "var(--color-text)",
                        }}
                      >
                        {contract.title}
                      </span>

                      <span
                        className="hl-tabular"
                        style={{ fontSize: "0.75rem", color: "var(--color-credits)" }}
                      >
                        +{contract.reward.credits} CR / +{contract.reward.xp} XP
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
