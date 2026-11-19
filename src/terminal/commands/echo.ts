import type { CommandContext, CommandResult } from "@/lib/types";
import { createVirtualEntry } from "./createVirtualEntry";
import { commandError } from "./shared";

const usage = "Uso: echo <texto> [> <archivo-virtual>]";

export default function echo(args: readonly string[]): CommandResult {
  if (!args.length) return commandError(usage);

  return { output: [args.join(" ")] };
}

export function redirectEcho(
  args: readonly string[],
  redirects: readonly number[],
  ctx: CommandContext,
): CommandResult {
  const operator = redirects[0];
  const destination = args.at(-1);
  if (
    redirects.length !== 1 ||
    operator === undefined ||
    operator < 1 ||
    operator !== args.length - 2 ||
    !destination
  ) {
    return commandError(usage);
  }

  return createVirtualEntry(destination, "file", ctx, args.slice(0, operator).join(" ") + "\n");
}
