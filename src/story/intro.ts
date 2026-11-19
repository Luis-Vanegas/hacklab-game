import type { DialogueLine } from "@/lib/types";

export interface IntroSlide {
  readonly id: string;
  readonly text: string;
  // La escena cambia de luz: el día es el trabajo, la noche es CIPHER (ADR-005)
  readonly mood: "day" | "night";
}

// Cada viñeta cabe en 160 caracteres para que la máquina de escribir no aburra
export const INTRO: readonly IntroSlide[] = [
  {
    id: "call",
    text: "Medellín, 2026. Después de meses enviando hojas de vida, por fin te llamaron.",
    mood: "day",
  },
  {
    id: "job",
    text: "Nodo Seguro, una empresa pequeña de ciberseguridad, te contrató como practicante.",
    mood: "day",
  },
  {
    id: "rule",
    text: "Tu jefa, Marta Ríos, te dio un portátil y una regla: «Solo se toca lo que el cliente autoriza por escrito».",
    mood: "day",
  },
  {
    id: "night",
    text: "Esa noche, en tu casa, la pantalla del portátil se enciende sola. Un mensaje sin remitente.",
    mood: "night",
  },
  {
    id: "cipher",
    text: "«Sé que sabes más de lo que crees. Tengo trabajos que pagan bien.» — CIPHER",
    mood: "night",
  },
];

// Primer día de trabajo: Marta enseña dónde pedir ayuda
export const WORK_WELCOME: readonly DialogueLine[] = [
  {
    character: "MARTA",
    text: "Te damos la bienvenida a Nodo Seguro. Tu equipo es nodo-ws-07 y ya está listo.",
  },
  {
    character: "MARTA",
    text: "Los tickets te llegan a la Bandeja. Cada uno dice qué hacer y qué está autorizado.",
  },
  {
    character: "MARTA",
    text: "¿No sabes un comando? Abre la Guía o escribe 'help'. Si te trabas, 'pista' te da una mano.",
  },
  {
    character: "MARTA",
    text: "Y recuerda la regla: sin autorización por escrito, no se toca nada.",
  },
];

// Primera noche: CIPHER presenta la darknet y su riesgo
export const DARKNET_WELCOME: readonly DialogueLine[] = [
  { character: "CIPHER", text: "Hola. No preguntes cómo entré a tu portátil." },
  {
    character: "CIPHER",
    text: "Mis encargos pagan más que tu práctica. Los verás en el tablero de la Darknet.",
  },
  {
    character: "CIPHER",
    text: "Pero cada movimiento sube tu trace. Si llega a 100, te encuentran. Y ahí se acaba todo.",
  },
];
