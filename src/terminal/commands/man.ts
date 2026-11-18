import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import type { CommandManual } from "./shared";

export default function createMan(getCommands: () => readonly CommandManual[]) {
  return (args: readonly string[]): CommandResult => {
    const [name] = args;
    if (args.length !== 1 || !name) return commandError("Uso: man <comando>");

    const command = getCommands().find((entry) => entry.name === name.toLowerCase());
    if (!command) return commandError("Sin manual para: " + name);

    return {
      output: ["Uso: " + command.usage, command.description, "Ejemplo: " + command.example],
    };
  };
}
