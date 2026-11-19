import workstation from "@/data/filesystem/workstation.json";
import type { FileSystemNode, FileSystemChange } from "@/lib/types";

// Filesystem virtual en memoria.
// Inmutable: cada operación retorna un árbol nuevo.
// Idempotente: crear un archivo que ya existe retorna el mismo árbol.

// El disco inicial es la estación de trabajo del jugador en Nodo Seguro.
// Vive en src/data para que Codex agregue archivos sin tocar el engine.
export function createRootFS(): FileSystemNode {
  return workstation as FileSystemNode;
}

export function resolve(root: FileSystemNode, path: string): FileSystemNode | null {
  if (path === "/" || path === "") return root;

  const parts = path.split("/").filter(Boolean);
  let current = root;

  for (const part of parts) {
    if (current.type !== "dir") return null;
    const child = current.children[part];
    if (!child) return null;
    current = child;
  }
  return current;
}

// Normaliza una ruta (resuelve .., ., y //)
export function normalizePath(currentDir: string, target: string): string {
  const isAbsolute = target.startsWith("/");
  const base = isAbsolute ? [] : currentDir.split("/").filter(Boolean);
  const parts = target.split("/").filter(Boolean);

  const result: string[] = [...base];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      result.pop();
      continue;
    }
    result.push(part);
  }

  return "/" + result.join("/");
}

// Lista los hijos de un directorio (respetando archivos ocultos según nivel)
export function listDir(node: FileSystemNode, showHidden: boolean): readonly string[] {
  if (node.type !== "dir") return [];
  return Object.values(node.children)
    .filter((child) => showHidden || !child.hidden)
    .map((child) => (child.type === "dir" ? child.name + "/" : child.name))
    .sort();
}

// Aplica cambios al filesystem de forma inmutable
export function applyChanges(
  root: FileSystemNode,
  changes: readonly FileSystemChange[],
): FileSystemNode {
  let current = root;
  for (const change of changes) {
    current = applySingleChange(current, change);
  }
  return current;
}

function applySingleChange(root: FileSystemNode, change: FileSystemChange): FileSystemNode {
  if (root.type !== "dir") return root;

  const parts = change.path.split("/").filter(Boolean);
  if (parts.length === 0) return root;

  return applyAtPath(root, parts, change);
}

function applyAtPath(
  node: FileSystemNode,
  parts: readonly string[],
  change: FileSystemChange,
): FileSystemNode {
  if (node.type !== "dir") return node;
  const [head, ...rest] = parts;
  if (!head) return node;

  if (rest.length === 0) {
    // Estamos en el directorio padre del target
    // Copia filtrada en vez de `delete`: el borrado tampoco muta el objeto
    const newChildren =
      change.action === "delete"
        ? Object.fromEntries(Object.entries(node.children).filter(([key]) => key !== head))
        : { ...node.children };
    if (change.action !== "delete" && change.node) {
      newChildren[head] = change.node;
    }
    return { ...node, children: newChildren };
  }

  // Recursión: bajar al siguiente nivel
  const child = node.children[head];
  if (!child || child.type !== "dir") return node;

  return {
    ...node,
    children: {
      ...node.children,
      [head]: applyAtPath(child, rest, change),
    },
  };
}
