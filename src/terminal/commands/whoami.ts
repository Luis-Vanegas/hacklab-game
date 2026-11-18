import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function whoami(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: whoami");
  return { output: [ctx.user] };
}
