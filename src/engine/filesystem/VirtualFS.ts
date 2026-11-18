import type { FileSystemNode, FileSystemChange } from "@/lib/types";

// Filesystem virtual en memoria.
// Inmutable: cada operación retorna un árbol nuevo.
// Idempotente: crear un archivo que ya existe retorna el mismo árbol.

export function createRootFS(): FileSystemNode {
  return {
    type: "dir",
    name: "/",
    permissions: "drwxr-xr-x",
    children: {
      home: {
        type: "dir",
        name: "home",
        permissions: "drwxr-xr-x",
        children: {
          user: {
            type: "dir",
            name: "user",
            permissions: "drwx------",
            children: {
              ".bashrc": {
                type: "file",
                name: ".bashrc",
                content: "# HackLab shell config\nexport PS1='hacklab@darknet:~$ '",
                permissions: "-rw-r--r--",
                hidden: true,
              },
              notes: {
                type: "file",
                name: "notes",
                content: "Bienvenido a la red. Escribe 'help' para empezar.",
                permissions: "-rw-r--r--",
              },
            },
          },
        },
      },
      etc: {
        type: "dir",
        name: "etc",
        permissions: "drwxr-xr-x",
        children: {
          passwd: {
            type: "file",
            name: "passwd",
            content: "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash",
            permissions: "-rw-r--r--",
          },
        },
      },
      var: {
        type: "dir",
        name: "var",
        permissions: "drwxr-xr-x",
        children: {
          log: {
            type: "dir",
            name: "log",
            permissions: "drwxr-xr-x",
            children: {
              "auth.log": {
                type: "file",
                name: "auth.log",
                content: "[2026-11-18 03:42:01] sshd: Failed password for root from 192.168.1.100\n[2026-11-18 03:42:05] sshd: Accepted password for user from 10.0.0.1",
                permissions: "-rw-r-----",
              },
            },
          },
        },
      },
    },
  };
}

// Resuelve una ruta absoluta a un nodo del filesystem
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
export function listDir(
  node: FileSystemNode,
  showHidden: boolean,
): readonly string[] {
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
    const newChildren = { ...node.children };
    if (change.action === "delete") {
      delete newChildren[head];
    } else if (change.node) {
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
