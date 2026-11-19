// Tema de terminal para dificultad "normal".
// Fondo de consola de operaciones y cursor verde. Los colores ANSI son los de Linux (palette.ts).

import type { ITheme } from "@xterm/xterm";
import { LINUX_COLORS } from "./palette";

export const normalTheme: ITheme = {
  ...LINUX_COLORS,
  background: "#0a0c10",
  cursor: "#00ff88",
  cursorAccent: "#0a0c10",
  selectionBackground: "rgba(0, 255, 136, 0.24)",
  selectionForeground: "#e6fff0",
  selectionInactiveBackground: "rgba(0, 255, 136, 0.12)",
  scrollbarSliderBackground: "rgba(200, 255, 212, 0.18)",
  scrollbarSliderHoverBackground: "rgba(200, 255, 212, 0.36)",
  scrollbarSliderActiveBackground: "rgba(200, 255, 212, 0.52)",
  overviewRulerBorder: "#161b22",
};
