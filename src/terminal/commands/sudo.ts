import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function sudo(args: readonly string[], ctx: CommandContext): CommandResult {
  if (!args[0]?.trim()) return commandError("Uso: sudo <comando>");

  return commandError(ctx.user + " no está en el grupo sudoers. Este incidente será reportado.");
}
