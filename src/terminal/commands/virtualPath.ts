import type { FileSystemNode } from "@/lib/types";

export function resolveVirtualPath(currentDir: string, path: string): string {
  const source =
    path === "~" || path.startsWith("~/")
      ? "/home/user" + path.slice(1)
      : path.startsWith("/")
        ? path
        : currentDir + "/" + path;
  const parts: string[] = [];

  for (const part of source.split("/")) {
    if (part === "..") {
      parts.pop();
    } else if (part !== "" && part !== ".") {
      parts.push(part);
    }
  }

  return "/" + parts.join("/");
}

export function findVirtualNode(root: FileSystemNode, absolutePath: string): FileSystemNode | null {
  const parts = absolutePath.split("/").filter(Boolean);
  let node = root;

  for (const part of parts) {
    // Solo las entradas propias del árbol representan archivos virtuales.
    if (node.type !== "dir" || !Object.hasOwn(node.children, part)) return null;

    const child = node.children[part];
    if (!child) return null;
    node = child;
  }

  return node;
}
