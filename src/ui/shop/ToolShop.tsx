// Modal de tienda de herramientas (Tienda).
// Usa <dialog> nativo con showModal() para gestión de foco, cierre con Esc y top-layer sin hacks.

import { useEffect, useId, useRef } from "react";
import type { ToolDefinition } from "@/lib/types";

export interface ToolShopProps {
  readonly open: boolean;
  readonly tools: readonly ToolDefinition[];
  readonly unlockedTools: readonly string[];
  readonly playerCredits: number;
  readonly playerLevel: number;
  readonly onBuyTool?: (toolId: string) => void;
  readonly onClose: () => void;
}

export function ToolShop({
  open,
  tools,
  unlockedTools,
  playerCredits,
  playerLevel,
  onBuyTool,
  onClose,
}: ToolShopProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="hl-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      data-testid="tool-shop-dialog"
    >
      <div className="hl-panel__header">
        <h2 id={titleId} className="hl-panel__title">
          MERCADO // TIENDA DE HERRAMIENTAS
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <span className="hl-badge hl-tabular" style={{ color: "var(--color-credits)" }}>
            SALDO: {playerCredits} CR
          </span>
          <button type="button" className="hl-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <div className="hl-panel__body">
        {tools.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            No hay herramientas disponibles en el catálogo actual.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--space-md)",
            }}
          >
            {tools.map((tool) => {
              const isOwned = unlockedTools.includes(tool.id);
              const meetsLevel = playerLevel >= tool.requiredLevel;
              const canAfford = playerCredits >= tool.price;
              const canBuy = !isOwned && meetsLevel && canAfford;

              return (
                <article
                  key={tool.id}
                  style={{
                    border: `1px solid ${isOwned ? "rgba(0, 255, 65, 0.35)" : "var(--color-border-strong)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-md)",
                    backgroundColor: "var(--color-surface-elevated)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-sm)",
                  }}
                  data-testid={`shop-tool-${tool.id}`}
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
                        fontSize: "0.95rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text)",
                      }}
                    >
                      {tool.name}
                    </h3>
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--color-accent)",
                      }}
                    >
                      {tool.command}
                    </code>
                  </div>

                  <p
                    style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-text-secondary)" }}
                  >
                    {tool.description}
                  </p>

                  <div
                    className="hl-tabular"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--space-xs)",
                      fontSize: "0.76rem",
                      color: "var(--color-text-muted)",
                      marginBlockStart: "auto",
                    }}
                  >
                    <span className="hl-badge">NIV {tool.requiredLevel}+</span>
                    <span
                      className={
                        tool.traceModifier > 0
                          ? "hl-badge hl-badge--warning"
                          : "hl-badge hl-badge--primary"
                      }
                    >
                      RASTREO{" "}
                      {tool.traceModifier > 0 ? `+${tool.traceModifier}` : tool.traceModifier}%
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--space-sm)",
                      marginBlockStart: "var(--space-xs)",
                    }}
                  >
                    <span
                      className="hl-tabular"
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: isOwned ? "var(--color-primary)" : "var(--color-credits)",
                      }}
                    >
                      {isOwned ? "INSTALADA" : `${tool.price} CR`}
                    </span>

                    {onBuyTool ? (
                      <button
                        type="button"
                        className={isOwned ? "hl-btn" : "hl-btn hl-btn--primary"}
                        disabled={!canBuy}
                        onClick={() => onBuyTool(tool.id)}
                      >
                        {isOwned
                          ? "Adquirida"
                          : !meetsLevel
                            ? `Req. NIV ${tool.requiredLevel}`
                            : !canAfford
                              ? "Créditos insuficientes"
                              : "Comprar"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </dialog>
  );
}
