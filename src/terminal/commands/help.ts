import type { CommandResult } from "@/lib/types";
import { commandCategoryLabels, commandError } from "./shared";
import type { CommandManual } from "./shared";

export default function createHelp(getCommands: () => readonly CommandManual[]) {
  return (args: readonly string[]): CommandResult => {
    if (args.length > 0) return commandError("Uso: help");

    const commands = getCommands();
    const output = Object.entries(commandCategoryLabels).flatMap(([category, label]) => {
      const entries = commands.filter((command) => command.category === category);
      if (entries.length === 0) return [];
      return [
        label,
        ...entries.map((command) => "  " + command.usage + " — " + command.description),
      ];
    });

    return { output };
  };
}
