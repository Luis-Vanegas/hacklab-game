// Tema de terminal para dificultad "beginner".
// Usa alto contraste cromático para guiar al jugador con colores semánticos claros:
// verde para éxito, amarillo para advertencias, rojo para errores y cian para pistas.

import type { ITheme } from "@xterm/xterm";

export const beginnerTheme: ITheme = {
  background: "#0d0d14",
  foreground: "#00ff41",
  cursor: "#00bfff",
  cursorAccent: "#0d0d14",
  selectionBackground: "rgba(0, 191, 255, 0.28)",
  selectionForeground: "#ffffff",
  selectionInactiveBackground: "rgba(0, 191, 255, 0.14)",
  scrollbarSliderBackground: "rgba(0, 255, 65, 0.22)",
  scrollbarSliderHoverBackground: "rgba(0, 255, 65, 0.42)",
  scrollbarSliderActiveBackground: "rgba(0, 255, 65, 0.62)",
  overviewRulerBorder: "#1a1a2e",

  black: "#0a0a0f",
  red: "#ff3e3e",
  green: "#00ff41",
  yellow: "#ffaa00",
  blue: "#00bfff",
  magenta: "#c77dff",
  cyan: "#00f5d4",
  white: "#e0e0e0",

  brightBlack: "#666680",
  brightRed: "#ff6b6b",
  brightGreen: "#52ff7c",
  brightYellow: "#ffd166",
  brightBlue: "#5ccfe6",
  brightMagenta: "#e0aaff",
  brightCyan: "#72efdd",
  brightWhite: "#ffffff",
};
