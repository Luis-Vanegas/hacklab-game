// Quién habla en el juego. `DialogueLine.character` usa estas claves.
export interface Character {
  readonly name: string;
  readonly role: string;
  // Canal al que pertenece: define el estilo del retrato y del globo de diálogo
  readonly channel: "work" | "darknet";
}

export const CHARACTERS = {
  MARTA: {
    name: "Marta Ríos",
    role: "Jefa de seguridad en Nodo Seguro",
    channel: "work",
  },
  CIPHER: {
    name: "CIPHER",
    role: "Contacto anónimo de la darknet",
    channel: "darknet",
  },
} as const satisfies Record<string, Character>;

export type CharacterId = keyof typeof CHARACTERS;
