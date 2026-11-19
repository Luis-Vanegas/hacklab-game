import services from "@/data/findings/services.json";
import type { CommandContext, CommandResult, Highlight } from "@/lib/types";
import { findContractTarget } from "./contractTarget";
import { commandError } from "./shared";

const notes = new Map(Object.entries(services));

export default function nmap(args: readonly string[], ctx: CommandContext): CommandResult {
  const [address] = args;
  if (args.length !== 1 || !address) return commandError("Uso: nmap <servidor-virtual>");

  const target = findContractTarget(ctx, address);
  if (!target) return commandError("Servidor ajeno al contrato activo.");
  if (!ctx.gameState.unlockedTools.includes("nmap")) {
    return commandError("Adquiere la herramienta con buy nmap.");
  }

  const columns = ["PUERTO", "ESTADO", "SERVICIO", "VERSIÓN"];
  const rows = target.ports.map(({ port, service, version }) => [
    port + "/tcp",
    "abierto",
    service,
    version,
  ]);
  const table = [columns, ...rows];
  const widths = columns.map((_, index) =>
    Math.max(...table.map((row) => (row[index] ?? "").length)),
  );

  const highlights: Highlight[] = [];
  for (const { port, service, vulnerable } of target.ports) {
    if (!vulnerable) continue;
    // Si un servicio se repite, identifica el hallazgo por su puerto.
    const repeated = target.ports.some((entry) => entry.port !== port && entry.service === service);
    highlights.push({
      text: repeated ? port + "/tcp" : service,
      kind: "finding",
      note: (notes.get(service.toLowerCase()) ?? services.legacy).note,
    });
  }
  return {
    output: [
      "Inventario virtual de " + target.hostname,
      ...table.map((row) =>
        row
          .map((cell, index) => (index === row.length - 1 ? cell : cell.padEnd(widths[index] ?? 0)))
          .join("  "),
      ),
    ],
    highlights,
  };
}
