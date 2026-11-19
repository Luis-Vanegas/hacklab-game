// Tema de terminal para dificultad "normal".
// Mantiene estética de consola de operaciones con paleta equilibrada y menor saturación
// en ayudas, conservando distinción semántica para estados de ejecución.

import type { ITheme } from "@xterm/xterm";

export const normalTheme: ITheme = {
  background: "#0a0c10",
  foreground: "#c8ffd4",
  cursor: "#00ff88",
  cursorAccent: "#0a0c10",
  selectionBackground: "rgba(0, 255, 136, 0.24)",
  selectionForeground: "#e6fff0",
  selectionInactiveBackground: "rgba(0, 255, 136, 0.12)",
  scrollbarSliderBackground: "rgba(200, 255, 212, 0.18)",
  scrollbarSliderHoverBackground: "rgba(200, 255, 212, 0.36)",
  scrollbarSliderActiveBackground: "rgba(200, 255, 212, 0.52)",
  overviewRulerBorder: "#161b22",

  black: "#0a0c10",
  red: "#f85149",
  green: "#00ff88",
  yellow: "#d29922",
  blue: "#58a6ff",
  magenta: "#bc8cff",
  cyan: "#39c5cf",
  white: "#c9d1d9",

  brightBlack: "#6e7681",
  brightRed: "#ff7b72",
  brightGreen: "#56d364",
  brightYellow: "#e3b341",
  brightBlue: "#79c0ff",
  brightMagenta: "#d2a8ff",
  brightCyan: "#56d4dd",
  brightWhite: "#f0f6fc",
};
