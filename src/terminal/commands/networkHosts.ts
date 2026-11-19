import network from "@/data/network/hosts.json";

export function normalizeNetworkName(name: string): string {
  return name.toLowerCase().replace(/\.$/u, "");
}

export function findNetworkName(name: string) {
  const key = normalizeNetworkName(name);
  return network.hosts.find((host) => host.hostname === key || host.aliases?.includes(key));
}

export function findNetworkHost(address: string) {
  return findNetworkName(address) ?? network.hosts.find((host) => host.ip === address);
}
