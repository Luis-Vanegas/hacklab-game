// Avisos tipo videojuego (GameNotifications.tsx).
// Consume useGameEvents() y useTraceLevel() desde @/store para mostrar notificaciones
// de "¡Objetivo completado! +50 XP", "Contrato completado", subida de rango animada
// y alarma roja visual cuando el rastreo alcanza o supera el 75 %.

import type { ReputationTier } from "@/lib/types";
import { useGameEvents, useTraceLevel, type QueuedGameAlert } from "@/store";

export interface GameNotificationsProps {
  readonly events?: readonly QueuedGameAlert[];
  readonly onDismiss?: (id: number) => void;
  readonly traceLevel?: number;
}

const TIER_LABELS: Record<ReputationTier, string> = {
  script_kiddie: "Novato",
  hacker: "Hacker",
  elite_hacker: "Hacker Élite",
  l33t: "L33T",
  anonymous: "Anónimo",
};

function renderAlertContent(alert: QueuedGameAlert) {
  switch (alert.type) {
    case "objective_completed":
      return {
        badge: "OBJETIVO COMPLETADO",
        badgeClass: "hl-badge hl-badge--primary",
        cardClass: "hl-alert-card",
        title: "¡Objetivo completado! +50 XP",
        subtitle: alert.description,
      };
    case "contract_completed":
      return {
        badge: "CONTRATO COMPLETADO",
        badgeClass: "hl-badge hl-badge--accent",
        cardClass: "hl-alert-card",
        title: `Contrato completado: ${alert.title}`,
        subtitle: `Recompensa: +${alert.credits} CR / +${alert.xp} XP`,
      };
    case "rank_up":
      return {
        badge: "¡NUEVO RANGO!",
        badgeClass: "hl-badge hl-badge--warning",
        cardClass: "hl-alert-card hl-alert-card--rank",
        title: `Ascenso de rango: ${TIER_LABELS[alert.from]} → ${TIER_LABELS[alert.to]}`,
        subtitle: "Nuevos contratos y herramientas desbloqueados en tu estación.",
      };
    case "trace_alarm":
      return {
        badge: "ALARMA DE RASTREO",
        badgeClass: "hl-badge hl-badge--danger",
        cardClass: "hl-alert-card hl-alert-card--alarm",
        title: `¡Rastreo crítico al ${alert.level} %!`,
        subtitle: "Peligro de detección inminente. Termina la operación antes de llegar al 100 %.",
      };
  }
}

export function GameNotifications({
  events: propEvents,
  onDismiss: propOnDismiss,
  traceLevel: propTraceLevel,
}: GameNotificationsProps = {}) {
  const storeEvents = useGameEvents();
  const storeTrace = useTraceLevel();

  const events = propEvents ?? storeEvents.events;
  const dismiss = propOnDismiss ?? storeEvents.dismiss;
  const traceLevel = propTraceLevel ?? storeTrace;

  const hasHighTrace =
    traceLevel >= 75 || events.some((event) => event.type === "trace_alarm" && event.level >= 75);

  if (events.length === 0 && !hasHighTrace) {
    return null;
  }

  return (
    <>
      {hasHighTrace ? (
        <div className="hl-trace-vignette" aria-hidden="true" data-testid="trace-alarm-vignette" />
      ) : null}

      {events.length > 0 ? (
        <aside
          className="hl-alert-stack"
          role="status"
          aria-live="polite"
          aria-label="Avisos de progreso del juego"
          data-testid="game-notifications"
        >
          {events.map((alert) => {
            const meta = renderAlertContent(alert);
            return (
              <div
                key={alert.id}
                className={meta.cardClass}
                data-testid={`game-alert-${alert.type}`}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span className={meta.badgeClass}>{meta.badge}</span>
                  <strong
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.88rem",
                      color: "var(--color-text)",
                    }}
                  >
                    {meta.title}
                  </strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    {meta.subtitle}
                  </span>
                </div>

                <button
                  type="button"
                  className="hl-btn"
                  style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                  aria-label="Cerrar aviso"
                  onClick={() => dismiss(alert.id)}
                  data-testid={`dismiss-alert-${alert.id}`}
                >
                  Cerrar
                </button>
              </div>
            );
          })}
        </aside>
      ) : null}
    </>
  );
}
