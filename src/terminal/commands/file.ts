import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export default function file(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path] = args;
  if (args.length !== 1 || !path || path.startsWith("-")) {
    return commandError("Uso: file <archivo>");
  }

  const node = findVirtualNode(ctx.filesystem, resolveVirtualPath(ctx.currentDir, path));
  if (!node) return commandError("Ruta virtual no encontrada: " + path);

  if (node.type === "dir") return { output: [path + ": directorio"] };
  return { output: [path + ": " + classifyContent(node.name, node.content)] };
}

function classifyContent(name: string, content: string): string {
  for (const character of content) {
    const code = character.charCodeAt(0);
    if ((code < 32 && !"\t\n\r".includes(character)) || code === 127) return "binario";
  }

  if (content.startsWith("#!") || /\.(?:sh|bash|py|ps1|js)$/iu.test(name)) return "script";
  return "texto";
}
