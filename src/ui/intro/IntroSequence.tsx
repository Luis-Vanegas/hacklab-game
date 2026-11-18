// Secuencia de introducción narrativa en 5 viñetas con efecto máquina de escribir.
// Avanza con Enter o clic (si el texto aún se está escribiendo, primero lo completa;
// si ya terminó, pasa a la siguiente viñeta) y permite saltar en cualquier momento.

import { useCallback, useEffect, useState } from "react";

export interface IntroVignette {
  readonly id?: string;
  readonly title?: string;
  readonly speaker?: string;
  readonly text: string;
}

export type IntroSlideInput = string | IntroVignette;

export interface IntroSequenceProps {
  readonly vignettes?: readonly IntroSlideInput[];
  readonly charIntervalMs?: number;
  readonly onComplete: () => void;
  readonly onSkip?: () => void;
}

export const DEFAULT_INTRO_VIGNETTES: readonly IntroVignette[] = [
  {
    id: "v1",
    title: "08:00 // MEDELLÍN — NODO SEGURO",
    speaker: "NARRADOR",
    text: "Hoy empiezas tus prácticas de ciberseguridad en Nodo Seguro. Tu escritorio huele a café recién molido y tienes acceso a tu primera estación de trabajo.",
  },
  {
    id: "v2",
    title: "08:15 // MESA DE SERVICIO",
    speaker: "MARTA RÍOS",
    text: "Bienvenido al equipo. Aquí trabajamos con alcance definido y autorización firmada. Cada comando que ejecutes deja huella: aprende a leer la red antes de tocar nada.",
  },
  {
    id: "v3",
    title: "18:30 // FIN DEL TURNO",
    speaker: "NARRADOR",
    text: "Tus compañeros apagan sus monitores, pero el sueldo de practicante apenas alcanza para las cuentas del mes. Antes de cerrar sesión, una terminal cifrada parpadea.",
  },
  {
    id: "v4",
    title: "23:40 // CANAL OCULTO",
    speaker: "CIPHER",
    text: "Vi cómo resolviste los tickets de hoy. Tengo encargos nocturnos que pagan en créditos reales. Sin preguntas, pero si el rastreo llega al 100 %, estás solo.",
  },
  {
    id: "v5",
    title: "00:00 // DOBLE VIDA",
    speaker: "NARRADOR",
    text: "De día construyes reputación como analista en Nodo Seguro. De noche operas en la darknet. Tu terminal está lista.",
  },
];

function normalizeVignette(item: IntroSlideInput, index: number): IntroVignette {
  if (typeof item === "string") {
    return {
      id: `vignette-${index + 1}`,
      title: `VIÑETA ${index + 1}`,
      text: item,
    };
  }
  return item;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function IntroSequence({
  vignettes = DEFAULT_INTRO_VIGNETTES,
  charIntervalMs = 22,
  onComplete,
  onSkip,
}: IntroSequenceProps) {
  const normalized = vignettes.map(normalizeVignette);
  const instantMode = prefersReducedMotion() || charIntervalMs <= 0;

  const [slideIndex, setSlideIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  const currentSlide = normalized[slideIndex];
  const hasCurrentSlide = currentSlide !== undefined;
  const fullText = currentSlide?.text ?? "";
  const fullTextLength = fullText.length;
  const visibleChars = instantMode ? fullTextLength : Math.min(typedChars, fullTextLength);
  const isTyping = visibleChars < fullTextLength;
  const isLastSlide = slideIndex >= normalized.length - 1;

  // Efecto máquina de escribir para la viñeta actual (sin setState síncrono en el cuerpo del efecto)
  useEffect(() => {
    if (!hasCurrentSlide || instantMode || visibleChars >= fullTextLength) {
      return;
    }

    const timer = window.setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= fullTextLength) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, charIntervalMs);

    return () => window.clearInterval(timer);
  }, [slideIndex, hasCurrentSlide, instantMode, visibleChars, fullTextLength, charIntervalMs]);

  const handleAdvance = useCallback(() => {
    if (!hasCurrentSlide) {
      onComplete();
      return;
    }

    if (isTyping) {
      setTypedChars(fullTextLength);
      return;
    }

    if (!isLastSlide) {
      setSlideIndex((prev) => prev + 1);
      setTypedChars(0);
    } else {
      onComplete();
    }
  }, [hasCurrentSlide, isTyping, fullTextLength, isLastSlide, onComplete]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  }, [onSkip, onComplete]);

  // Avance con tecla Enter
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAdvance]);

  if (normalized.length === 0 || !currentSlide) {
    return null;
  }

  return (
    <main
      className="hl-intro-screen"
      aria-label="Introducción narrativa"
      onClick={handleAdvance}
      data-testid="intro-sequence"
    >
      <article
        className="hl-intro-card"
        onClick={(e) => {
          e.stopPropagation();
          handleAdvance();
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
            borderBlockEnd: "1px solid var(--color-border)",
            paddingBlockEnd: "var(--space-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            {currentSlide.speaker ? (
              <span className="hl-badge hl-badge--primary">{currentSlide.speaker}</span>
            ) : null}
            {currentSlide.title ? (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  color: "var(--color-accent)",
                }}
              >
                {currentSlide.title}
              </span>
            ) : null}
          </div>

          <span
            className="hl-tabular"
            style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}
            data-testid="intro-progress"
          >
            {slideIndex + 1} / {normalized.length}
          </span>
        </header>

        <p
          style={{
            margin: 0,
            minBlockSize: "4.8rem",
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--color-text)",
          }}
          data-testid="intro-text"
        >
          {fullText.slice(0, visibleChars)}
          {isTyping ? (
            <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>
              ▋
            </span>
          ) : null}
        </p>

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
            paddingBlockStart: "var(--space-xs)",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Presiona Enter o haz clic para continuar
          </span>

          <div style={{ display: "flex", gap: "var(--space-sm)" }}>
            <button
              type="button"
              className="hl-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              data-testid="intro-skip-btn"
            >
              Saltar
            </button>

            <button
              type="button"
              className="hl-btn hl-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAdvance();
              }}
              data-testid="intro-next-btn"
            >
              {isTyping ? "Mostrar texto" : isLastSlide ? "Comenzar" : "Siguiente"}
            </button>
          </div>
        </footer>
      </article>
    </main>
  );
}
