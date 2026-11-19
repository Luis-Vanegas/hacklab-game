// Pantalla de título de HackLab Game.
// Muestra el logo en fuente pixel ("Press Start 2P" / "VT323") y permite iniciar
// una nueva partida o continuar si existe una partida guardada.

import { useEffect } from "react";

export interface TitleScreenProps {
  readonly hasSavedGame?: boolean;
  readonly onNewGame: () => void;
  readonly onContinue?: () => void;
}

export function TitleScreen({ hasSavedGame = false, onNewGame, onContinue }: TitleScreenProps) {
  useEffect(() => {
    if (
      typeof document === "undefined" ||
      (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) ||
      document.querySelector('link[data-hacklab-fonts="pixel"]')
    ) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap";
    link.media = "print";
    link.setAttribute("data-hacklab-fonts", "pixel");
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);
  }, []);

  return (
    <main className="hl-title-screen" aria-label="Pantalla de título" data-testid="title-screen">
      <div className="hl-title-card">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <h1 className="hl-pixel-logo">HACKLAB</h1>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
              color: "var(--color-accent)",
              letterSpacing: "0.04em",
            }}
          >
            NODO SEGURO // SIMULADOR DE CIBERSEGURIDAD
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--color-text-secondary)",
            maxInlineSize: "48ch",
          }}
        >
          De día defiendes tu ciudad. De noche respondes a los encargos de la darknet sin dejar
          rastro.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "var(--space-md)",
            inlineSize: "100%",
          }}
        >
          {hasSavedGame && onContinue ? (
            <button
              type="button"
              className="hl-btn hl-btn--primary"
              style={{ minInlineSize: "180px", padding: "10px 18px", fontSize: "0.95rem" }}
              onClick={onContinue}
              data-testid="title-continue-btn"
            >
              Continuar
            </button>
          ) : null}

          <button
            type="button"
            className={hasSavedGame ? "hl-btn" : "hl-btn hl-btn--primary"}
            style={{ minInlineSize: "180px", padding: "10px 18px", fontSize: "0.95rem" }}
            onClick={onNewGame}
            data-testid="title-new-game-btn"
          >
            Nueva partida
          </button>
        </div>
      </div>
    </main>
  );
}
