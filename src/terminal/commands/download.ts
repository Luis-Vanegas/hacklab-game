import darknetTrace from "@/data/levels/darknet-trace.json";
import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

const traceByContract: Readonly<Record<string, number>> = darknetTrace;

export default function download(args: readonly string[], ctx: CommandContext): CommandResult {
  const [source] = args;
  if (args.length !== 1 || !source?.startsWith("/")) {
    return commandError("Uso: download <ruta-virtual-absoluta>");
  }

  const contract = ctx.gameState.activeContract;
  if (!contract || ctx.connectedTo !== contract.target.hostname) {
    return commandError("Abre una sesión virtual en el servidor del contrato.");
  }

  const { target } = contract;
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

  const output = ["Copia virtual guardada en " + destination + "."];
  const trace = traceByContract[contract.id] ?? 0;
  const traceLevel = Math.min(100, ctx.gameState.traceLevel + trace);
  if (trace > 0) output.push("Rastreo de la copia virtual: " + traceLevel + " %.");

  return {
    output,
    ...(trace > 0 ? { stateChanges: { traceLevel } } : {}),
    outputType: "success",
    filesystemChanges: [{ path: destination, action: "create", node: { ...file, name } }],
  };
}
