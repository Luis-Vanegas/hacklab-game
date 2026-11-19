import type { CommandContext, CommandResult } from "@/lib/types";
import { commands } from "./commands";
import { redirectEcho } from "./commands/echo";
import { commandError, findCommand } from "./commands/shared";

export type ParsedCommand = {
  readonly command: string;
  readonly args: readonly string[];
  readonly outputRedirects?: readonly number[];
};

export function parseCommand(input: string): ParsedCommand | { error: string } | null {
  const tokens: string[] = [];
  const redirects: number[] = [];
  let token = "";
  let tokenQuoted = false;
  let started = false;
  let quote: '"' | "'" | null = null;

  function pushToken() {
    if (!tokenQuoted && token === ">") redirects.push(tokens.length - 1);
    tokens.push(token);
    token = "";
    tokenQuoted = false;
    started = false;
  }

  for (const character of input) {
    if (quote !== null) {
      if (character === quote) quote = null;
      else token += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      tokenQuoted = true;
      started = true;
    } else if (/\s/u.test(character)) {
      if (started) pushToken();
    } else {
      token += character;
      started = true;
    }
  }

  if (quote !== null) return { error: "Hay una comilla sin cerrar." };
  if (started) pushToken();

  const [command, ...args] = tokens;
  if (command === undefined) return null;
  if (command === "") return { error: "El nombre del comando está vacío." };

  const name = command.toLowerCase();
  const parsed = { command: findCommand(commands, name)?.name ?? name, args };
  // La redirección es virtual y solo se admite con echo.
  if (parsed.command === "echo" && redirects.length > 0) {
    return { ...parsed, outputRedirects: redirects };
  }
  return parsed;
}

export function executeCommand(input: string, ctx: CommandContext): CommandResult {
  const parsed = parseCommand(input);
  if (parsed === null) return { output: [] };
  if ("error" in parsed) return commandError(parsed.error);

  const command = commands.find((entry) => entry.name === parsed.command);
  if (!command) return commandError("Comando desconocido: " + parsed.command);

  if (parsed.outputRedirects) return redirectEcho(parsed.args, parsed.outputRedirects, ctx);

  return command.run(parsed.args, ctx);
}
