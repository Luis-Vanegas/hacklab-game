import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { sha256 } from "./sha256";
import { readVirtualFile } from "./virtualFile";

export default function sha256sum(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path] = args;
  if (args.length !== 1 || !path || path.startsWith("-")) {
    return commandError("Uso: sha256sum <archivo>");
  }

  const file = readVirtualFile(path, ctx);
  if (!file) return commandError("Archivo virtual no encontrado: " + path);

  return { output: [sha256(new TextEncoder().encode(file.content)) + "  " + path] };
}
