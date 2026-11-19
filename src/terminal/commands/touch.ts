import type { CommandContext, CommandResult } from "@/lib/types";
import { createVirtualEntry } from "./createVirtualEntry";
import { commandError } from "./shared";

export default function touch(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path] = args;
  if (args.length !== 1 || !path || path.startsWith("-") || /\/\.{0,2}$/u.test(path)) {
    return commandError("Uso: touch <archivo>");
  }

  return createVirtualEntry(path, "file", ctx);
}
