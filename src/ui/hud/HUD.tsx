// Barra superior (HUD) del juego.
// Presenta telemetría clave del jugador (usuario, reputación, créditos, trace, host conectado)
// y acceso rápido a la tienda de herramientas.

import type { PlayerState } from "@/lib/types";
import { ReputationBadge } from "./ReputationBadge";
import { TraceBar } from "./TraceBar";

export interface HUDProps {
  readonly player: PlayerState;
  readonly traceLevel: number;
  readonly connectedTo?: string | null;
  readonly onOpenShop?: () => void;
}

export function HUD({ player, traceLevel, connectedTo = null, onOpenShop }: HUDProps) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "safe center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        padding: "var(--space-sm) var(--space-md)",
        backgroundColor: "rgba(18, 18, 26, 0.94)",
        borderBlockEnd: "1px solid var(--color-border)",
      }}
      data-testid="hud"
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap" }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "var(--color-primary)",
            letterSpacing: "0.04em",
          }}
        >
          HACKLAB // {player.username}
        </span>
        <ReputationBadge tier={player.reputation} level={player.level} xp={player.xp} />
        <span
          className="hl-badge hl-tabular"
          style={{ color: "var(--color-credits)", borderColor: "rgba(0, 255, 136, 0.35)" }}
          data-testid="hud-credits"
        >
          {player.credits} CR
        </span>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap" }}
      >
        <span
          className={connectedTo ? "hl-badge hl-badge--accent hl-tabular" : "hl-badge hl-tabular"}
          data-testid="hud-connection"
        >
          {connectedTo ? `REMOTE: ${connectedTo}` : "LOCALHOST"}
        </span>
        <TraceBar traceLevel={traceLevel} />
        {onOpenShop ? (
          <button type="button" className="hl-btn hl-btn--primary" onClick={onOpenShop}>
            Tool Shop
          </button>
        ) : null}
      </div>
    </header>
  );
}
