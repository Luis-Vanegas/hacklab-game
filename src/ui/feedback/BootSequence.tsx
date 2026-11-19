// Secuencia de arranque de HackLab OS al entrar al computador (2–3 s, saltable).
// Simula el chequeo de kernel, cifrado y montaje de interfaz antes de abrir el escritorio.

import { useCallback, useEffect, useState } from "react";

export interface BootSequenceProps {
  readonly durationMs?: number;
  readonly onComplete: () => void;
}

const BOOT_LINES: readonly string[] = [
  "[OK] Inicializando kernel HackLab OS v2.6-medellin...",
  "[OK] Montando sistema de archivos virtual en /home/user...",
  "[OK] Verificando enlace corporativo Nodo Seguro (10.20.0.15/24)...",
  "[OK] Cargando túnel cifrado de bandeja y demonios de telemetría...",
  "[LISTO] Estación de trabajo operativa.",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BootSequence({ durationMs = 2400, onComplete }: BootSequenceProps) {
  const instant = prefersReducedMotion() || durationMs <= 0;
  const [step, setStep] = useState(0);
  const visibleLines = instant ? BOOT_LINES.length : Math.min(BOOT_LINES.length, step + 1);
  const progressPercent = Math.round((visibleLines / BOOT_LINES.length) * 100);

  const handleFinish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (instant) {
      return;
    }

    const stepInterval = Math.max(250, Math.floor(durationMs / BOOT_LINES.length));
    const intervalId = window.setInterval(() => {
      setStep((prev) => Math.min(BOOT_LINES.length - 1, prev + 1));
    }, stepInterval);

    const doneTimer = window.setTimeout(() => {
      handleFinish();
    }, durationMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(doneTimer);
    };
  }, [durationMs, instant, handleFinish]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape" || event.key === " ") {
        if (
          (event.key === "Enter" || event.key === " ") &&
          event.target instanceof HTMLElement &&
          event.target.closest("button")
        ) {
          return;
        }
        event.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFinish]);

  return (
    <main
      aria-label="Secuencia de arranque de HackLab OS"
      style={{
        minBlockSize: "100dvh",
        inlineSize: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-lg)",
        backgroundColor: "var(--color-bg)",
      }}
      data-testid="boot-sequence"
    >
      <section
        className="hl-panel"
        style={{
          maxInlineSize: "620px",
          inlineSize: "100%",
          padding: "var(--space-lg)",
          gap: "var(--space-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              color: "var(--color-primary)",
            }}
          >
            HACKLAB OS // ARRANQUE DEL SISTEMA
          </h1>
          <span className="hl-badge hl-tabular">{progressPercent}%</span>
        </div>

        <progress
          className="hl-progress"
          aria-label="Progreso de arranque de HackLab OS"
          max={100}
          value={progressPercent}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minBlockSize: "7.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.84rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {BOOT_LINES.slice(0, visibleLines).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="hl-btn hl-btn--primary"
            onClick={handleFinish}
            data-testid="boot-skip-btn"
          >
            Saltar arranque
          </button>
        </div>
      </section>
    </main>
  );
}
