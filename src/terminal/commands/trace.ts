import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function trace(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: trace");
  return { output: ["Nivel de rastreo: " + ctx.gameState.traceLevel + "%"] };
}
