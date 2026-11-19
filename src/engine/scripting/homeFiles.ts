import { resolve } from "@/engine/filesystem";
import type { FileSystemChange, FileSystemNode } from "@/lib/types";

// Archivos de texto por ruta absoluta: lo que viaja entre el juego y el intérprete de Python.
export type FileMap = Readonly<Record<string, string>>;

const FILE_PERMISSIONS = "-rw-r--r--";
const DIR_PERMISSIONS = "drwxr-xr-x";

// Copia plana de los archivos bajo `dir`. Las carpetas vacías no viajan: el script no las necesita.
export function collectFiles(root: FileSystemNode, dir: string): FileMap {
  const start = resolve(root, dir);
  const files: Record<string, string> = {};
  const walk = (node: FileSystemNode, path: string) => {
    if (node.type === "file") {
      files[path] = node.content;
      return;
    }
    for (const [name, child] of Object.entries(node.children)) walk(child, path + "/" + name);
  };
  if (start?.type === "dir") walk(start, dir === "/" ? "" : dir);
  return files;
}

// Traduce lo que el script dejó en disco a cambios del filesystem virtual.
// Las carpetas nuevas se crean antes que sus archivos porque applyChanges no crea intermedias.
export function fileChanges(
  root: FileSystemNode,
  before: FileMap,
  after: FileMap,
): FileSystemChange[] {
  const dirs: FileSystemChange[] = [];
  const files: FileSystemChange[] = [];
  const createdDirs = new Set<string>();

  for (const [path, content] of Object.entries(after)) {
    if (before[path] === content) continue;
    const name = path.slice(path.lastIndexOf("/") + 1);
    const node: FileSystemNode = { type: "file", name, content, permissions: FILE_PERMISSIONS };
    const existing = resolve(root, path);
    // Un archivo nuevo encima de algo que no es archivo (por ejemplo, una carpeta) no se aplica
    if (existing && existing.type !== "file") continue;
    if (!existing) {
      for (const dir of missingParents(root, path)) {
        if (createdDirs.has(dir)) continue;
        createdDirs.add(dir);
        dirs.push({ path: dir, action: "create", node: emptyDir(dir) });
      }
    }
    files.push({ path, action: existing ? "modify" : "create", node });
  }

  for (const path of Object.keys(before)) {
    if (!(path in after)) files.push({ path, action: "delete" });
  }

  return [...dirs, ...files];
}

function missingParents(root: FileSystemNode, path: string): string[] {
  const parts = path.split("/").filter(Boolean).slice(0, -1);
  const missing: string[] = [];
  let current = "";
  for (const part of parts) {
    current += "/" + part;
    if (!resolve(root, current)) missing.push(current);
  }
  return missing;
}

function emptyDir(path: string): FileSystemNode {
  const name = path.slice(path.lastIndexOf("/") + 1);
  return { type: "dir", name, children: {}, permissions: DIR_PERMISSIONS };
}
