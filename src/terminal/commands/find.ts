import type { CommandContext, CommandResult, FileSystemNode } from "@/lib/types";
import { commandError } from "./shared";
import { findVirtualNode, resolveVirtualPath } from "./virtualPath";

export default function find(args: readonly string[], ctx: CommandContext): CommandResult {
  const [path, flag, pattern] = args;
  if (args.length !== 3 || !path || flag !== "-name" || !pattern) {
    return commandError("Uso: find <ruta> -name <patrón>");
  }

  const rootPath = resolveVirtualPath(ctx.currentDir, path);
  const root = findVirtualNode(ctx.filesystem, rootPath);
  if (!root) return commandError("Ruta virtual no encontrada: " + path);

  const wildcards = Array.from(pattern);
  const matches: string[] = [];
  const pending: { path: string; node: FileSystemNode }[] = [{ path: rootPath, node: root }];
  for (const entry of pending) {
    if (matchesName(entry.node.name, wildcards)) matches.push(entry.path);
    if (entry.node.type !== "dir") continue;

    const prefix = entry.path === "/" ? "/" : entry.path + "/";
    for (const [name, node] of Object.entries(entry.node.children)) {
      pending.push({ path: prefix + name, node });
    }
  }

  return { output: matches.sort() };
}

function matchesName(name: string, pattern: readonly string[]): boolean {
  const letters = Array.from(name);
  let position = 0;
  let token = 0;
  let lastStar = -1;
  let afterStar = 0;

  while (position < letters.length) {
    if (pattern[token] === "*") {
      lastStar = token;
      afterStar = position;
      token += 1;
    } else if (pattern[token] === "?" || pattern[token] === letters[position]) {
      position += 1;
      token += 1;
    } else if (lastStar >= 0) {
      // Amplía solo el último asterisco para evitar explorar combinaciones superpuestas.
      position = ++afterStar;
      token = lastStar + 1;
    } else {
      return false;
    }
  }

  while (pattern[token] === "*") token += 1;
  return token === pattern.length;
}
