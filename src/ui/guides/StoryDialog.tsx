// Globo de diálogo del personaje guía (ej. CIPHER).
// Permite avanzar por las líneas de narrativa o cerrar la transmisión al finalizar.

import { useState } from "react";
import type { DialogueLine } from "@/lib/types";

export interface StoryDialogProps {
  readonly lines: readonly DialogueLine[];
  readonly onDismiss?: () => void;
}

export function StoryDialog({ lines, onDismiss }: StoryDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (lines.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, lines.length - 1);
  const currentLine = lines[safeIndex];

  if (!currentLine) {
    return null;
  }

  const isLastLine = safeIndex >= lines.length - 1;

  const handleAdvance = () => {
    if (!isLastLine) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onDismiss?.();
    }
  };

  return (
    <section
      aria-label={`Incoming transmission from ${currentLine.character}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        padding: "var(--space-sm) var(--space-md)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-strong)",
        backgroundColor: "rgba(18, 18, 26, 0.96)",
        boxShadow: "var(--shadow-panel)",
      }}
      data-testid="story-dialog"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "var(--color-primary)",
            }}
          >
            {currentLine.character}
          </span>
          <span
            className="hl-tabular"
            style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
          >
            [{safeIndex + 1}/{lines.length}]
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-text)" }}>
          {currentLine.text}
        </p>
      </div>

      <button type="button" className="hl-btn hl-btn--primary" onClick={handleAdvance}>
        {isLastLine ? "Acknowledge" : "Next"}
      </button>
    </section>
  );
}
