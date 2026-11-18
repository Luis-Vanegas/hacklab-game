// Guía visual progresiva para el jugador.
// Muestra pistas contextuales en dificultades iniciales ("beginner" y "normal")
// y desaparece automáticamente en niveles avanzados ("elite" y "anonymous").

import type { GameDifficulty } from "@/lib/types";

export interface CommandHintProps {
  readonly hint?: string | null;
  readonly difficulty: GameDifficulty;
  readonly commandExample?: string;
}

export function CommandHint({ hint, difficulty, commandExample }: CommandHintProps) {
  if (!hint || difficulty === "elite" || difficulty === "anonymous") {
    return null;
  }

  return (
    <aside
      aria-label="Tactical Command Hint"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-sm)",
        padding: "var(--space-sm) var(--space-md)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid rgba(0, 191, 255, 0.35)",
        backgroundColor: "rgba(0, 191, 255, 0.08)",
        fontSize: "0.84rem",
        color: "var(--color-text)",
      }}
      data-testid="command-hint"
    >
      <div>
        <strong
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-accent)",
            marginInlineEnd: "var(--space-sm)",
          }}
        >
          [HINT]
        </strong>
        <span>{hint}</span>
      </div>
      {commandExample && difficulty === "beginner" ? (
        <code
          style={{
            fontFamily: "var(--font-mono)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-terminal-bg)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          {commandExample}
        </code>
      ) : null}
    </aside>
  );
}
