export { COMMAND_GUIDE, CONTRACTS, LOCAL_HOST, TOOLS, useGameStore } from "./gameStore";
export * from "./hooks";
export type { CommandManual } from "@/terminal/commands/shared";
export type { PythonStatus } from "./python/pythonRunner";
export type {
  ContractChannel,
  Finding,
  GameAlert,
  NetworkNode,
  Packet,
  QueuedGameAlert,
} from "@/lib/types";
export type { Capture } from "./gameStore";
// La historia es contenido fijo: la UI la toma de aquí, como el resto de datos
export { CHARACTERS, DARKNET_WELCOME, INTRO, WORK_WELCOME } from "@/story";
export type { Character, CharacterId, IntroSlide } from "@/story";
