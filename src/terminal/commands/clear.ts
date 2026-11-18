import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function clear(args: readonly string[]): CommandResult {
  if (args.length > 0) return commandError("Uso: clear");
  // La terminal visual interpreta la señal; el comando no conoce xterm.
  return { output: [], clearScreen: true };
}
