// Barra de nivel de rastreo (Rastreo 0-100 %).
// Usa <progress> nativo por accesibilidad y cambia el color del indicador según el riesgo de detección.

import { useId } from "react";

export interface TraceBarProps {
  readonly traceLevel: number;
}

export function TraceBar({ traceLevel }: TraceBarProps) {
  const labelId = useId();
  const clamped = Math.max(0, Math.min(100, Math.round(traceLevel)));

  const fillVar =
    clamped >= 75
      ? "var(--color-danger)"
      : clamped >= 40
        ? "var(--color-warning)"
        : "var(--color-primary)";

  const statusText = clamped >= 75 ? "CRÍTICO" : clamped >= 40 ? "ELEVADO" : "BAJO";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-sm)",
        minInlineSize: "180px",
      }}
      data-testid="trace-bar"
    >
      <span
        id={labelId}
        className="hl-tabular"
        style={{
          fontSize: "0.78rem",
          color: clamped >= 75 ? "var(--color-danger)" : "var(--color-text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        RASTREO {clamped}% ({statusText})
      </span>
      <progress
        className="hl-progress"
        aria-labelledby={labelId}
        max={100}
        value={clamped}
        style={{ "--progress-bar-fill": fillVar } as React.CSSProperties}
      />
    </div>
  );
}
