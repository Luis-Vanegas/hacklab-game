// Barrel de temas de terminal.
// Permite seleccionar el tema de xterm.js según la dificultad activa del juego.

import type { ITheme } from "@xterm/xterm";
import type { GameDifficulty } from "@/lib/types";
import { beginnerTheme } from "./beginner";
import { eliteTheme } from "./elite";
import { normalTheme } from "./normal";

export { beginnerTheme, normalTheme, eliteTheme };

export const terminalThemes: Record<GameDifficulty, ITheme> = {
  beginner: beginnerTheme,
  normal: normalTheme,
  elite: eliteTheme,
  anonymous: eliteTheme,
};

export function getTerminalTheme(difficulty: GameDifficulty): ITheme {
  return terminalThemes[difficulty];
}
