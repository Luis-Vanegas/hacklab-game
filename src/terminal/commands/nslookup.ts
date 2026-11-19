import workstation from "@/data/machine/workstation.json";
import type { CommandResult } from "@/lib/types";
import { findNetworkName } from "./networkHosts";
import { commandError } from "./shared";

export default function nslookup(args: readonly string[]): CommandResult {
  const [domain] = args;
  if (args.length !== 1 || !domain) return commandError("Uso: nslookup <dominio>");

  const host = findNetworkName(domain);
  if (!host) return commandError("Dominio sin registro en la red virtual.");

  return {
    output: [
      "Servidor DNS: " + workstation.dns.join(", "),
      "Nombre: " + host.hostname,
      "Dirección: " + host.ip,
    ],
  };
}
