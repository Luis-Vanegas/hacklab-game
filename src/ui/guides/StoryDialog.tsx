// Globo de diálogo del personaje guía con retrato pixel SVG liviano (Marta Ríos o CIPHER).
// Usa CHARACTERS desde @/store para mostrar el nombre real del personaje (ej. "Marta Ríos")
// en lugar de la clave ("MARTA") y aplica el estilo del canal ("work" o "darknet").

import { useState } from "react";
import type { DialogueLine } from "@/lib/types";
import { CHARACTERS, type CharacterId } from "@/store";

export interface StoryDialogProps {
  readonly lines: readonly DialogueLine[];
  readonly onDismiss?: () => void;
}

export type CharacterAvatarKind = "marta" | "cipher" | "operator";

export function resolveAvatarKind(character: string): CharacterAvatarKind {
  const upper = character.toUpperCase();
  if (upper.includes("MARTA")) {
    return "marta";
  }
  if (upper.includes("CIPHER")) {
    return "cipher";
  }
  return "operator";
}

export function resolveCharacterDisplayName(characterKey: string): string {
  if (characterKey in CHARACTERS) {
    return CHARACTERS[characterKey as CharacterId].name;
  }
  return characterKey;
}

function PixelPortrait({ character }: { readonly character: string }) {
  const kind = resolveAvatarKind(character);

  if (kind === "marta") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        aria-label="Retrato pixel de Marta Ríos"
        style={{
          flexShrink: 0,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-accent)",
          backgroundColor: "#0e1a28",
        }}
        data-testid="portrait-marta"
      >
        {/* Cabello oscuro */}
        <rect x="3" y="2" width="10" height="3" fill="#23192d" />
        <rect x="2" y="4" width="2" height="7" fill="#23192d" />
        <rect x="12" y="4" width="2" height="7" fill="#23192d" />
        {/* Rostro */}
        <rect x="4" y="4" width="8" height="7" fill="#e5b58f" />
        {/* Gafas tácticas cian */}
        <rect x="4" y="6" width="3" height="2" fill="#00bfff" />
        <rect x="9" y="6" width="3" height="2" fill="#00bfff" />
        <rect x="7" y="6" width="2" height="1" fill="#182436" />
        {/* Sonrisa */}
        <rect x="6" y="9" width="4" height="1" fill="#8c4f3e" />
        {/* Chaqueta corporativa Nodo Seguro */}
        <rect x="3" y="11" width="10" height="5" fill="#1b4d7e" />
        <rect x="7" y="11" width="2" height="5" fill="#e4e8f0" />
      </svg>
    );
  }

  if (kind === "cipher") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        aria-label="Retrato pixel de CIPHER"
        style={{
          flexShrink: 0,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-primary)",
          backgroundColor: "#09130c",
        }}
        data-testid="portrait-cipher"
      >
        {/* Capucha oscura */}
        <rect x="3" y="1" width="10" height="3" fill="#121814" />
        <rect x="2" y="3" width="2" height="9" fill="#121814" />
        <rect x="12" y="3" width="2" height="9" fill="#121814" />
        {/* Rostro en sombra */}
        <rect x="4" y="4" width="8" height="7" fill="#070a08" />
        {/* Visor verde neón */}
        <rect x="5" y="6" width="2" height="2" fill="#00ff41" />
        <rect x="9" y="6" width="2" height="2" fill="#00ff41" />
        {/* Máscara digital */}
        <rect x="5" y="9" width="6" height="2" fill="#1b2b20" />
        <rect x="6" y="9" width="1" height="1" fill="#00ff41" />
        <rect x="9" y="9" width="1" height="1" fill="#00ff41" />
        {/* Hombros */}
        <rect x="2" y="12" width="12" height="4" fill="#151f18" />
      </svg>
    );
  }

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-label={`Retrato pixel de ${character}`}
      style={{
        flexShrink: 0,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border-strong)",
        backgroundColor: "#141622",
      }}
      data-testid="portrait-operator"
    >
      <rect x="4" y="2" width="8" height="3" fill="#2d3446" />
      <rect x="4" y="5" width="8" height="6" fill="#d9a982" />
      <rect x="5" y="7" width="2" height="1" fill="#141622" />
      <rect x="9" y="7" width="2" height="1" fill="#141622" />
      <rect x="3" y="11" width="10" height="5" fill="#2b3a55" />
    </svg>
  );
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
  const avatarKind = resolveAvatarKind(currentLine.character);
  const displayName = resolveCharacterDisplayName(currentLine.character);

  const handleAdvance = () => {
    if (!isLastLine) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onDismiss?.();
    }
  };

  return (
    <section
      aria-label={`Transmisión entrante de ${displayName}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        padding: "var(--space-sm) var(--space-md)",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${
          avatarKind === "marta" ? "rgba(0, 191, 255, 0.45)" : "var(--color-border-strong)"
        }`,
        backgroundColor: "rgba(18, 18, 26, 0.96)",
        boxShadow: "var(--shadow-panel)",
      }}
      data-testid="story-dialog"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <PixelPortrait character={currentLine.character} />

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "0.82rem",
                color: avatarKind === "marta" ? "var(--color-accent)" : "var(--color-primary)",
              }}
            >
              {displayName}
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
      </div>

      <button type="button" className="hl-btn hl-btn--primary" onClick={handleAdvance}>
        {isLastLine ? "Entendido" : "Siguiente"}
      </button>
    </section>
  );
}
