// Secuencia de introducción narrativa en 5 viñetas con efecto máquina de escribir.
// Usa INTRO desde @/store por defecto (o viñetas pasadas por props), avanza con Enter
// o clic (si el texto aún se está escribiendo, primero lo completa; si ya terminó, pasa
// a la siguiente viñeta) y permite saltar en cualquier momento.

import { useCallback, useEffect, useState } from "react";
import { INTRO, type IntroSlide } from "@/store";

export interface IntroVignette {
  readonly id?: string;
  readonly title?: string;
  readonly speaker?: string;
  readonly text: string;
  readonly mood?: "day" | "night";
}

export type IntroSlideInput = string | IntroSlide | IntroVignette;

export interface IntroSequenceProps {
  readonly vignettes?: readonly IntroSlideInput[];
  readonly charIntervalMs?: number;
  readonly onComplete: () => void;
  readonly onSkip?: () => void;
}

export const DEFAULT_INTRO_VIGNETTES: readonly IntroSlide[] = INTRO;

function normalizeVignette(item: IntroSlideInput, index: number): IntroVignette {
  if (typeof item === "string") {
    return {
      id: `vignette-${index + 1}`,
      title: `VIÑETA ${index + 1}`,
      text: item,
      mood: "day",
    };
  }
  const mood = "mood" in item && item.mood ? item.mood : "day";
  const title =
    "title" in item && item.title
      ? item.title
      : mood === "night"
        ? "TURNO NOCHE // DARKNET"
        : "TURNO DÍA // NODO SEGURO";
  const speaker = "speaker" in item ? item.speaker : undefined;

  return {
    id: item.id ?? `vignette-${index + 1}`,
    title,
    speaker,
    text: item.text,
    mood,
  };
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
  const isNight = currentSlide?.mood === "night";

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleSkip();
        return;
      }
      if (event.key === "Enter") {
        if (event.target instanceof HTMLElement && event.target.closest("button")) {
          return;
        }
        event.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAdvance, handleSkip]);

  if (normalized.length === 0 || !currentSlide) {
    return null;
  }

  return (
    <main
      className="hl-intro-screen"
      aria-label="Introducción narrativa"
      onClick={handleAdvance}
      data-testid="intro-sequence"
      data-mood={currentSlide.mood ?? "day"}
    >
      <h1 className="visually-hidden">Introducción narrativa de HackLab</h1>
      <article
        className="hl-intro-card"
        style={{
          borderColor: isNight ? "rgba(0, 255, 65, 0.45)" : "rgba(0, 191, 255, 0.45)",
        }}
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
            <span className={isNight ? "hl-badge hl-badge--primary" : "hl-badge hl-badge--accent"}>
              {currentSlide.speaker ?? (isNight ? "NOCHE" : "DÍA")}
            </span>
            {currentSlide.title ? (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  color: isNight ? "var(--color-primary)" : "var(--color-accent)",
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
