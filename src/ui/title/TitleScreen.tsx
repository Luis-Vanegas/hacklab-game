// Pantalla de título de HackLab Game.
// Muestra el logo en fuente pixel ("Press Start 2P" / "VT323"), pide el nombre de usuario
// antes de iniciar una nueva partida (validado con newGame) y permite continuar si hay partida.

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useNewGame } from "@/store";

export interface TitleScreenProps {
  readonly hasSavedGame?: boolean;
  readonly onNewGame: ((playerName?: string) => string | null) | (() => void);
  readonly onContinue?: () => void;
}

export function TitleScreen({ hasSavedGame = false, onNewGame, onContinue }: TitleScreenProps) {
  const storeNewGame = useNewGame();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputId = useId();
  const ruleId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const handleNewGameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = username.trim();

    // Si el contenedor ya recibe el nombre (K3), delegamos validación y navegación en él
    if (onNewGame.length >= 1) {
      const callbackError = (onNewGame as (playerName?: string) => string | null)(trimmed);
      if (typeof callbackError === "string" && callbackError.length > 0) {
        setError(callbackError);
        inputRef.current?.focus();
        return;
      }
      setError(null);
      return;
    }

    // Compatibilidad con App.tsx actual (() => { newGame(); setScreen("intro"); })
    const validationError = storeNewGame(trimmed);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    (onNewGame as () => void)();
    if (trimmed.length > 0) {
      storeNewGame(trimmed);
    }
  };

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

        <form className="hl-title-form" noValidate onSubmit={handleNewGameSubmit}>
          <div className="hl-title-field">
            <label htmlFor={inputId} className="hl-title-field__label">
              Nombre de usuario
            </label>
            <span id={ruleId} className="hl-title-field__rule" data-testid="title-username-rule">
              Minúsculas, números, <code>-</code> y <code>_</code>, hasta 16 caracteres (vacío usa{" "}
              <code>anonymous</code>).
            </span>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={24}
              value={username}
              placeholder="anonymous"
              className="hl-search-input hl-title-field__input"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${ruleId} ${errorId}` : ruleId}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              data-testid="title-username-input"
            />
            {error ? (
              <p
                id={errorId}
                role="alert"
                className="hl-title-field__error"
                data-testid="title-username-error"
              >
                {error}
              </p>
            ) : null}
          </div>

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
              type="submit"
              className={hasSavedGame ? "hl-btn" : "hl-btn hl-btn--primary"}
              style={{ minInlineSize: "180px", padding: "10px 18px", fontSize: "0.95rem" }}
              data-testid="title-new-game-btn"
            >
              Nueva partida
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
