import type { CommandContext, CommandResult } from "@/lib/types";
import { previewFile } from "./virtualFile";

export default function head(args: readonly string[], ctx: CommandContext): CommandResult {
  return previewFile("head", args, ctx);
}
