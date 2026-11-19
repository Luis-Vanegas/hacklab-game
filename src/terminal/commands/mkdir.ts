import type { CommandContext, CommandResult } from "@/lib/types";
import { createVirtualEntry } from "./createVirtualEntry";
import { commandError } from "./shared";

export default function mkdir(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path] = args;
  if (args.length !== 1 || !path || path.startsWith("-")) {
    return commandError("Uso: mkdir <directorio>");
  }

  return createVirtualEntry(path, "dir", ctx);
}
