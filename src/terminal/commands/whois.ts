import network from "@/data/network/hosts.json";
import type { CommandResult } from "@/lib/types";
import { findNetworkHost, normalizeNetworkName } from "./networkHosts";
import { commandError } from "./shared";

export default function whois(args: readonly string[]): CommandResult {
  const [domain] = args;
  if (args.length !== 1 || !domain) return commandError("Uso: whois <dominio>");

  const name = normalizeNetworkName(domain);
  const host = findNetworkHost(name);
  const registration = network.registrations.find(
    (entry) => entry.domain === name || (host && name.endsWith("." + entry.domain)),
  );
  if (!registration) return commandError("Dominio sin registro en la red virtual.");

  return {
    output: [
      "Dominio: " + registration.domain,
      "Titular: " + registration.owner,
      "Creación: " + registration.createdAt,
      "Actualización: " + registration.updatedAt,
      "Vencimiento: " + registration.expiresAt,
    ],
  };
}
