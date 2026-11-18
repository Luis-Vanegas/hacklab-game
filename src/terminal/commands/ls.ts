import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export default function ls(args: readonly string[], ctx: CommandContext): CommandResult {
  const showHidden = args[0] === "-a";
  const paths = showHidden ? args.slice(1) : args;
  const [path = "."] = paths;

  if (paths.length > 1 || !path || path.startsWith("-")) {
    return commandError("Uso: ls [-a] [ruta]");
  }

  const node = findVirtualNode(ctx.filesystem, resolveVirtualPath(ctx.currentDir, path));
  if (node?.type !== "dir") return commandError("Directorio virtual no encontrado: " + path);

  return {
    output: Object.values(node.children)
      .filter((child) => showHidden || !child.hidden)
      .map((child) => child.name + (child.type === "dir" ? "/" : ""))
      .sort(),
  };
}
