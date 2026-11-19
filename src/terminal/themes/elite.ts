// Tema de terminal para dificultades "elite" y "anonymous".
// Fondo casi negro y cursor neutro. Los colores ANSI son los de Linux (palette.ts):
// el reto de élite es no tener pistas del juego, no una terminal sin colores.

import type { ITheme } from "@xterm/xterm";
import { LINUX_COLORS } from "./palette";

export const eliteTheme: ITheme = {
  ...LINUX_COLORS,
  background: "#07080a",
  cursor: "#d4d7dd",
  cursorAccent: "#07080a",
  selectionBackground: "rgba(212, 215, 221, 0.22)",
  selectionForeground: "#ffffff",
  selectionInactiveBackground: "rgba(212, 215, 221, 0.1)",
  scrollbarSliderBackground: "rgba(212, 215, 221, 0.15)",
  scrollbarSliderHoverBackground: "rgba(212, 215, 221, 0.3)",
  scrollbarSliderActiveBackground: "rgba(212, 215, 221, 0.45)",
  overviewRulerBorder: "#14171c",
};
