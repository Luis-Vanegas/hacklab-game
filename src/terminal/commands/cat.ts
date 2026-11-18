import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export default function cat(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path] = args;
  if (args.length !== 1 || !path) return commandError("Uso: cat <archivo>");

  const node = findVirtualNode(ctx.filesystem, resolveVirtualPath(ctx.currentDir, path));
  if (node?.type !== "file") return commandError("Archivo virtual no encontrado: " + path);

  return { output: node.content.split(/\r?\n/u) };
}
