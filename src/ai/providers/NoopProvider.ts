import type { AiProvider } from "@/lib/types";

// Proveedor de IA que no hace nada.
// Es el default: el juego funciona completo sin modelos.
// Las pistas vienen de los tutoriales estáticos en data/tutorials/.

export const noopProvider: AiProvider = {
  available: false,

  async getHint() {
    return null;
  },

  async validateSolution() {
    return null;
  },
};
