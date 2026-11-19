import type { CommandContext, CommandResult, Highlight } from "@/lib/types";
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

  const output: string[] = [];
  const highlights: Highlight[] = [];
  for (const child of Object.values(node.children)) {
    if (!showHidden && child.hidden) continue;
    if (child.type === "dir") {
      const text = child.name + "/";
      output.push(text);
      highlights.push({ text, kind: "dir" });
    } else {
      output.push(child.name);
      if (child.permissions.includes("x")) highlights.push({ text: child.name, kind: "exec" });
    }
  }
  return { output: output.sort(), highlights };
}
