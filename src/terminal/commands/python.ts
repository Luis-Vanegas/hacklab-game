import examples from "@/data/tutorials/python-examples.json";
import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

const outputByPath: Readonly<Record<string, readonly string[]>> = examples;

export default function python(args: readonly string[], ctx: CommandContext): CommandResult {
  const [script] = args;
  if (args.length !== 1 || !script || script.startsWith("-")) {
    return commandError("Uso: python <script>");
  }

  const path = resolveVirtualPath(ctx.currentDir, script);
  const output = outputByPath[path];
  if (!output || findVirtualNode(ctx.filesystem, path)?.type !== "file") {
    return commandError(
      "No hay salida guardada para este script y el intérprete de Python no está disponible.",
    );
  }

  return { output: ["Salida simulada:", ...output] };
}
