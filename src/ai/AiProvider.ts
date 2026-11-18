import type { AiProvider } from "@/lib/types";
import { noopProvider } from "./providers/NoopProvider";

// Punto de entrada del módulo de IA.
// Por defecto retorna NoopProvider (sin IA).
// Se puede intercambiar en runtime si NVIDIA o Ollama están disponibles.

let currentProvider: AiProvider = noopProvider;

export function getAiProvider(): AiProvider {
  return currentProvider;
}

export function setAiProvider(provider: AiProvider): void {
  currentProvider = provider;
}
