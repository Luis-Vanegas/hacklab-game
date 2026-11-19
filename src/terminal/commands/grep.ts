import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";
import { fileLines, readVirtualFile } from "./virtualFile";

export default function grep(args: readonly string[], ctx: CommandContext): CommandResult {
  const usage = "Uso: grep [-i] [-c] <patrón literal> <archivo>";
  let ignoreCase = false;
  let countOnly = false;
  let index = 0;

  for (const option of args) {
    if (!option.startsWith("-")) break;
    index += 1;
    if (option === "--") break;
    if (!/^-[ic]+$/u.test(option)) return commandError(usage);

    ignoreCase ||= option.includes("i");
    countOnly ||= option.includes("c");
  }

  const [pattern, path] = args.slice(index);
  if (args.length - index !== 2 || pattern === undefined || !path) return commandError(usage);

  const file = readVirtualFile(path, ctx);
  if (!file) return commandError("Archivo virtual no encontrado: " + path);

  const needle = ignoreCase ? pattern.toLowerCase() : pattern;
  const matches = fileLines(file.content).filter((line) =>
    (ignoreCase ? line.toLowerCase() : line).includes(needle),
  );

  return { output: countOnly ? [String(matches.length)] : matches };
}
