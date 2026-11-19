import type { CommandContext, CommandResult } from "@/lib/types";

export interface CommandManual {
  readonly name: string;
  readonly aliases?: readonly string[];
  readonly usage: string;
  readonly description: string;
  readonly example: string;
}

export interface CommandDefinition extends CommandManual {
  readonly run: (args: readonly string[], ctx: CommandContext) => CommandResult;
}

export function findCommand<T extends CommandManual>(
  entries: readonly T[],
  name: string,
): T | undefined {
  const key = name.toLowerCase();
  return (
    entries.find((entry) => entry.name === key) ??
    entries.find((entry) => entry.aliases?.includes(key))
  );
}

export function commandError(message: string): CommandResult {
  return { output: [message], error: message, outputType: "error" };
}
