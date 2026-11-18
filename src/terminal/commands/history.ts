import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function history(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: history");
  // Numeración desde 1 alineada a la derecha, como `history` de bash.
  return { output: ctx.history.map((line, i) => String(i + 1).padStart(3) + "  " + line) };
}
