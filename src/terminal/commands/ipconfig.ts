import workstation from "@/data/machine/workstation.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function ipconfig(args: readonly string[]): CommandResult {
  if (args.length > 0) return commandError("Uso: ipconfig");

  return {
    output: [
      "Equipo: " + workstation.hostname,
      ...workstation.interfaces.flatMap((adapter) => [
        "Interfaz " + adapter.name + ":",
        "  IPv4: " + adapter.ipv4 + "/" + adapter.prefixLength,
        "  Máscara: " + adapter.netmask,
        "  MAC: " + adapter.mac,
      ]),
      "Puerta de enlace: " + workstation.gateway,
      "DNS: " + workstation.dns.join(", "),
    ],
  };
}
