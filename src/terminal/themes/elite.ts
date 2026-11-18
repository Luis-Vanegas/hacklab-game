// Tema de terminal para dificultades "elite" y "anonymous".
// Minimalista y monocromático: elimina pistas cromáticas de guía para simular una
// consola austera donde el jugador interpreta la salida sin asistencia visual.

import type { ITheme } from "@xterm/xterm";

export const eliteTheme: ITheme = {
  background: "#07080a",
  foreground: "#d4d7dd",
  cursor: "#d4d7dd",
  cursorAccent: "#07080a",
  selectionBackground: "rgba(212, 215, 221, 0.22)",
  selectionForeground: "#ffffff",
  selectionInactiveBackground: "rgba(212, 215, 221, 0.1)",
  scrollbarSliderBackground: "rgba(212, 215, 221, 0.15)",
  scrollbarSliderHoverBackground: "rgba(212, 215, 221, 0.3)",
  scrollbarSliderActiveBackground: "rgba(212, 215, 221, 0.45)",
  overviewRulerBorder: "#14171c",

  black: "#07080a",
  red: "#b8bec8",
  green: "#d4d7dd",
  yellow: "#c4c9d2",
  blue: "#aeb5c0",
  magenta: "#b8bec8",
  cyan: "#c4c9d2",
  white: "#d4d7dd",

  brightBlack: "#5a6270",
  brightRed: "#d4d7dd",
  brightGreen: "#eef0f4",
  brightYellow: "#e2e5eb",
  brightBlue: "#c4c9d2",
  brightMagenta: "#d4d7dd",
  brightCyan: "#e2e5eb",
  brightWhite: "#ffffff",
};
