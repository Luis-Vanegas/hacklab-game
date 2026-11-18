import type { SaveData } from "./types";

const STORAGE_KEY = "hacklab-game-save";
const CURRENT_VERSION = 1;

// Persistencia con schema versionado.
// Si el schema cambia, se agrega una migración y no se pierden datos.

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;
const migrations: Record<number, Migration> = {
  // Ejemplo: cuando exista v2:
  // 1: (data) => ({ ...data, newField: "default" }),
};

export function save(data: Omit<SaveData, "version" | "savedAt">): boolean {
  try {
    const saveData: SaveData = {
      ...data,
      version: CURRENT_VERSION,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    return true;
  } catch {
    return false;
  }
}

export function load(): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    let data = JSON.parse(raw) as Record<string, unknown>;
    let version = (data.version as number) ?? 0;

    // Aplicar migraciones secuencialmente
    while (version < CURRENT_VERSION) {
      const migrate = migrations[version];
      if (!migrate) return null; // Migración faltante, datos irrecuperables
      data = migrate(data);
      version++;
    }

    return data as unknown as SaveData;
  } catch {
    return null;
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage bloqueado: no hay nada que hacer
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
