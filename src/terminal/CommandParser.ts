import type { CommandContext, CommandResult } from "@/lib/types";
import { commands } from "./commands";
import { commandError } from "./commands/shared";

export type ParsedCommand = { readonly command: string; readonly args: readonly string[] };

export function parseCommand(input: string): ParsedCommand | { error: string } | null {
  const tokens: string[] = [];
  let token = "";
  let started = false;
  let quote: '"' | "'" | null = null;

  for (const character of input) {
    if (quote !== null) {
      if (character === quote) quote = null;
      else token += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      started = true;
    } else if (/\s/u.test(character)) {
      if (started) tokens.push(token);
      token = "";
      started = false;
    } else {
      token += character;
      started = true;
    }
  }

  if (quote !== null) return { error: "Hay una comilla sin cerrar." };
  if (started) tokens.push(token);

  const [command, ...args] = tokens;
  if (command === undefined) return null;
  if (command === "") return { error: "El nombre del comando está vacío." };

  return { command: command.toLowerCase(), args };
}

export function executeCommand(input: string, ctx: CommandContext): CommandResult {
  const parsed = parseCommand(input);
  if (parsed === null) return { output: [] };
  if ("error" in parsed) return commandError(parsed.error);

  const command = commands.find((entry) => entry.name === parsed.command);
  if (!command) return commandError("Comando desconocido: " + parsed.command);

  return command.run(parsed.args, ctx);
}
