import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export default function download(args: readonly string[], ctx: CommandContext): CommandResult {
  const [source] = args;
  if (args.length !== 1 || !source?.startsWith("/")) {
    return commandError("Uso: download <ruta-virtual-absoluta>");
  }

  const target = ctx.gameState.activeContract?.target;
  if (!target || ctx.connectedTo !== target.hostname) {
    return commandError("Abre una sesión virtual en el servidor del contrato.");
  }

  const sourcePath = resolveVirtualPath("/", source);
  const file = findVirtualNode(target.filesystem, sourcePath);
  const name = sourcePath.split("/").at(-1);
  if (file?.type !== "file" || !name || name === "__proto__") {
    return commandError("Archivo virtual no encontrado: " + source);
  }

  const currentDir = resolveVirtualPath("/", ctx.currentDir);
  if (findVirtualNode(ctx.filesystem, currentDir)?.type !== "dir") {
    return commandError("El directorio virtual de destino no existe.");
  }

  const destination = resolveVirtualPath(currentDir, name);
  const existing = findVirtualNode(ctx.filesystem, destination);
  if (existing?.type === "file" && existing.content === file.content) {
    return { output: ["Ya tienes la copia virtual en " + destination + "."] };
  }
  if (existing) return commandError("Ya existe otra entrada en " + destination + ".");

  return {
    output: ["Copia virtual guardada en " + destination + "."],
    outputType: "success",
    filesystemChanges: [{ path: destination, action: "create", node: { ...file, name } }],
  };
}
