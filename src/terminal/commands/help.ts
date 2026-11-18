import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import type { CommandManual } from "./shared";

export default function createHelp(getCommands: () => readonly CommandManual[]) {
  return (args: readonly string[]): CommandResult => {
    if (args.length > 0) return commandError("Uso: help");

    return {
      output: getCommands().map((command) => command.usage + " — " + command.description),
    };
  };
}
