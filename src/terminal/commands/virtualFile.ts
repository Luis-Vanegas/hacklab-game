import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export function readVirtualFile(path: string, ctx: CommandContext) {
  const node = findVirtualNode(ctx.filesystem, resolveVirtualPath(ctx.currentDir, path));
  return node?.type === "file" ? node : null;
}

export function fileLines(content: string): string[] {
  if (content === "") return [];

  const lines = content.split(/\r?\n/u);
  if (content.endsWith("\n")) lines.pop();
  return lines;
}

export function previewFile(
  command: "head" | "tail",
  args: readonly string[],
  ctx: CommandContext,
): CommandResult {
  const [first, rawCount, explicitPath] = args;
  const usage = "Uso: " + command + " [-n <número>] <archivo>";
  const hasCount = first === "-n";
  const path = hasCount ? explicitPath : first;
  if (args.length !== (hasCount ? 3 : 1) || !path || path.startsWith("-")) {
    return commandError(usage);
  }

  const count = hasCount ? Number(rawCount) : 10;
  if (hasCount && (!rawCount || !/^\d+$/u.test(rawCount) || !Number.isSafeInteger(count))) {
    return commandError(usage);
  }

  const file = readVirtualFile(path, ctx);
  if (!file) return commandError("Archivo virtual no encontrado: " + path);

  const lines = fileLines(file.content);
  return {
    output:
      command === "head" ? lines.slice(0, count) : lines.slice(Math.max(0, lines.length - count)),
  };
}
