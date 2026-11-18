import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

const HOME_DIR = "/home/user";

export default function cd(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 1) return commandError("Uso: cd [ruta]");

  const [path] = args;
  const target = path ? resolveVirtualPath(ctx.currentDir, path) : HOME_DIR;
  const node = findVirtualNode(ctx.filesystem, target);

  if (!node) return commandError("Directorio virtual no encontrado: " + (path ?? HOME_DIR));
  if (node.type !== "dir") return commandError("No es un directorio: " + (path ?? HOME_DIR));

  // El engine aplica `cwd` solo si no hay error: aquí no se toca el estado.
  return { output: [], cwd: target };
}
