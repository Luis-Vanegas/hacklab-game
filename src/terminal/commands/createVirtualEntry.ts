import type { CommandContext, CommandResult, FileSystemNode } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export function createVirtualEntry(
  path: string,
  type: FileSystemNode["type"],
  ctx: CommandContext,
): CommandResult {
  const destination = resolveVirtualPath(ctx.currentDir, path);
  const separator = destination.lastIndexOf("/");
  const name = destination.slice(separator + 1);
  if (!name || name === "__proto__" || path.includes("\0")) {
    return commandError("Nombre virtual inválido: " + path);
  }

  const parent = findVirtualNode(ctx.filesystem, destination.slice(0, separator) || "/");
  if (parent?.type !== "dir") return commandError("El directorio padre no existe: " + path);

  const existing = findVirtualNode(ctx.filesystem, destination);
  if (existing?.type === type) return { output: [] };
  if (existing) return commandError("Ya existe una entrada de otro tipo: " + path);

  const hidden = name.startsWith(".");
  const node: FileSystemNode =
    type === "file"
      ? { type, name, hidden, permissions: "-rw-r--r--", content: "" }
      : { type, name, hidden, permissions: "drwxr-xr-x", children: {} };

  return { output: [], filesystemChanges: [{ path: destination, action: "create", node }] };
}
