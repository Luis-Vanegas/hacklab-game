// Tema de terminal para dificultad "beginner".
// Fondo azul noche y cursor celeste. Los colores ANSI son los de Linux (palette.ts);
// las pistas para principiantes se marcan aparte, con los hallazgos (S3).

import type { ITheme } from "@xterm/xterm";
import { LINUX_COLORS } from "./palette";

export const beginnerTheme: ITheme = {
  ...LINUX_COLORS,
  background: "#0d0d14",
  cursor: "#00bfff",
  cursorAccent: "#0d0d14",
  selectionBackground: "rgba(0, 191, 255, 0.28)",
  selectionForeground: "#ffffff",
  selectionInactiveBackground: "rgba(0, 191, 255, 0.14)",
  scrollbarSliderBackground: "rgba(0, 255, 65, 0.22)",
  scrollbarSliderHoverBackground: "rgba(0, 255, 65, 0.42)",
  scrollbarSliderActiveBackground: "rgba(0, 255, 65, 0.62)",
  overviewRulerBorder: "#1a1a2e",
};
