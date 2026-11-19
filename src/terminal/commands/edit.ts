import type { CommandContext, CommandResult, FileSystemNode } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

const HOME = "/home/user";
// Un script de curso cabe de sobra; evita guardar textos enormes en memoria
export const MAX_FILE_CHARS = 20_000;

// Única regla de dónde se puede escribir: la usan `edit` y el guardado del editor.
// Solo dentro de /home/user, en una carpeta que exista, y nunca encima de una carpeta.
export function editablePathError(root: FileSystemNode, path: string): string | null {
  if (!path.startsWith(HOME + "/")) return "Solo puedes editar archivos dentro de /home/user.";
  const parent = path.slice(0, path.lastIndexOf("/"));
  if (findVirtualNode(root, parent)?.type !== "dir") return "No existe la carpeta " + parent + ".";
  if (findVirtualNode(root, path)?.type === "dir") return path + " es una carpeta, no un archivo.";
  return null;
}

export default function edit(args: readonly string[], ctx: CommandContext): CommandResult {
  const [target] = args;
  if (args.length !== 1 || !target || target.startsWith("-")) {
    return commandError("Uso: edit <archivo>");
  }

  const path = resolveVirtualPath(ctx.currentDir, target);
  const error = editablePathError(ctx.filesystem, path);
  if (error) return commandError(error);

  const node = findVirtualNode(ctx.filesystem, path);
  const content = node?.type === "file" ? node.content : "";
  return {
    output: [(node ? "Abriendo " : "Creando ") + path + " en el editor. Guarda con Ctrl+S."],
    openEditor: { path, content },
  };
}
