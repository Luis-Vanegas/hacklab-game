import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function pwd(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: pwd");
  return { output: [ctx.currentDir] };
}
