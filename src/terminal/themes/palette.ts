// Paleta ANSI común a todos los temas: la de una terminal de Linux sobre fondo oscuro.
// Los colores no son una ayuda del juego sino parte de la terminal (carpetas en azul,
// errores en rojo), así que se ven igual en todas las dificultades (S2).

import type { ITheme } from "@xterm/xterm";

export const LINUX_COLORS: ITheme = {
  foreground: "#d0d7de",
  black: "#0a0c10",
  red: "#f85149",
  green: "#3fb950",
  yellow: "#d29922",
  blue: "#58a6ff",
  magenta: "#bc8cff",
  cyan: "#39c5cf",
  white: "#c9d1d9",

  brightBlack: "#8b949e",
  brightRed: "#ff7b72",
  brightGreen: "#56d364",
  brightYellow: "#e3b341",
  brightBlue: "#79c0ff",
  brightMagenta: "#d2a8ff",
  brightCyan: "#56d4dd",
  brightWhite: "#f0f6fc",
};
