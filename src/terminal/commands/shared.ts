import type { CommandContext, CommandResult } from "@/lib/types";

export interface CommandManual {
  readonly name: string;
  readonly usage: string;
  readonly description: string;
  readonly example: string;
}

export interface CommandDefinition extends CommandManual {
  readonly run: (args: readonly string[], ctx: CommandContext) => CommandResult;
}

export function commandError(message: string): CommandResult {
  return { output: [message], error: message, outputType: "error" };
}
