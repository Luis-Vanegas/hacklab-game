import acme from "@/data/contracts/01-first-hack.json";
import archivo from "@/data/contracts/02-data-heist.json";
import type { CommandContext, Contract, FileSystemNode } from "@/lib/types";

// Las pruebas de datos comprueban los valores literales que TypeScript amplía al importar JSON.
export const acmeContract = acme as Contract;
export const archiveContract = archivo as Contract;

export function file(name: string, content: string, hidden = false): FileSystemNode {
  return { name, type: "file", permissions: "-rw-r--r--", content, hidden };
}

export function directory(name: string, children: Record<string, FileSystemNode>): FileSystemNode {
  return { name, type: "dir", permissions: "drwxr-xr-x", children };
}

export function makeContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    gameState: {
      phase: "playing",
      difficulty: "beginner",
      activeContract: null,
      completedContracts: [],
      unlockedTools: [],
      traceLevel: 18,
      connectedTo: null,
      storyFlags: {},
      player: {
        username: "prueba",
        credits: 500,
        xp: 0,
        level: 1,
        reputation: "script_kiddie",
      },
    },
    currentDir: "/home/user",
    filesystem: directory("/", {
      home: directory("home", {
        user: directory("user", {
          notes: file("notes", "Bienvenida\r\nPaso dos"),
          ".profile": file(".profile", "Perfil", true),
          "mis notas.txt": file("mis notas.txt", "Nota con espacios"),
          sub: directory("sub", {}),
        }),
      }),
      etc: directory("etc", { passwd: file("passwd", "Cuentas ficticias") }),
    }),
    user: "prueba",
    hostname: "darknet",
    connectedTo: null,
    difficulty: "beginner",
    history: [],
    ...overrides,
  };
}
