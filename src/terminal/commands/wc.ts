import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { readVirtualFile } from "./virtualFile";

export default function wc(args: readonly string[], ctx: CommandContext): CommandResult {
  const onlyLines = args[0] === "-l";
  const path = args[onlyLines ? 1 : 0];
  if (args.length !== (onlyLines ? 2 : 1) || !path || path.startsWith("-")) {
    return commandError("Uso: wc [-l] <archivo>");
  }

  const file = readVirtualFile(path, ctx);
  if (!file) return commandError("Archivo virtual no encontrado: " + path);

  const lines = file.content.match(/\n/gu)?.length ?? 0;
  if (onlyLines) return { output: [lines + " " + path] };

  const words = file.content.match(/\S+/gu)?.length ?? 0;
  const bytes = new TextEncoder().encode(file.content).length;
  return { output: [[lines, words, bytes, path].join(" ")] };
}
