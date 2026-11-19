import type { CommandDefinition } from "./shared";
import buy from "./buy";
import cat from "./cat";
import cd from "./cd";
import clear from "./clear";
import crack from "./crack";
import download from "./download";
import createHelp from "./help";
import history from "./history";
import ls from "./ls";
import createMan from "./man";
import nmap from "./nmap";
import curl from "./curl";
import ipconfig from "./ipconfig";
import netstat from "./netstat";
import nslookup from "./nslookup";
import ping from "./ping";
import traceroute from "./traceroute";
import whois from "./whois";
import pwd from "./pwd";
import ssh from "./ssh";
import trace from "./trace";
import whoami from "./whoami";

const help = createHelp(() => commands);
const man = createMan(() => commands);

export const commands: readonly CommandDefinition[] = [
  {
    name: "buy",
    usage: "buy <herramienta>",
    description: "Comprar una herramienta del juego.",
    example: "buy nmap",
    run: buy,
  },
  {
    name: "cat",
    usage: "cat <archivo>",
    description: "Leer un archivo virtual.",
    example: "cat notes",
    run: cat,
  },
  {
    name: "cd",
    usage: "cd [ruta]",
    description: "Cambiar de directorio virtual; sin ruta vuelve a /home/user.",
    example: "cd /etc",
    run: cd,
  },
  {
    name: "clear",
    usage: "clear",
    description: "Limpiar la pantalla de la terminal.",
    example: "clear",
    run: clear,
  },
  {
    name: "crack",
    usage: "crack ficha",
    description: "Resolver el desafío de ficha escrito para la misión.",
    example: "crack ficha",
    run: crack,
  },
  {
    name: "download",
    usage: "download <ruta-virtual-absoluta>",
    description: "Copiar un archivo ficticio al directorio del jugador.",
    example: "download /archivo.txt",
    run: download,
  },
  {
    name: "help",
    usage: "help",
    description: "Listar los comandos registrados.",
    example: "help",
    run: help,
  },
  {
    name: "history",
    usage: "history",
    description: "Listar los comandos ejecutados en la sesión.",
    example: "history",
    run: history,
  },
  {
    name: "ls",
    usage: "ls [-a] [ruta]",
    description: "Listar archivos y carpetas virtuales.",
    example: "ls -a /home/user",
    run: ls,
  },
  {
    name: "man",
    usage: "man <comando>",
    description: "Consultar el manual de un comando.",
    example: "man ls",
    run: man,
  },
  {
    name: "nmap",
    usage: "nmap <servidor-virtual>",
    description: "Leer el inventario de puertos de la misión.",
    example: "nmap acme.example",
    run: nmap,
  },
  {
    name: "ipconfig",
    aliases: ["ifconfig"],
    usage: "ipconfig",
    description: "Mostrar la configuración de red del equipo. Alias: ifconfig.",
    example: "ipconfig",
    run: ipconfig,
  },
  {
    name: "ping",
    usage: "ping <host>",
    description: "Comprobar si un equipo simulado responde en la red.",
    example: "ping 10.20.0.1",
    run: ping,
  },
  {
    name: "nslookup",
    usage: "nslookup <dominio>",
    description: "Consultar la dirección de un dominio en el DNS virtual.",
    example: "nslookup intranet.nodoseguro.test",
    run: nslookup,
  },
  {
    name: "traceroute",
    usage: "traceroute <host>",
    description: "Mostrar los saltos simulados hasta un equipo.",
    example: "traceroute archivo.example",
    run: traceroute,
  },
  {
    name: "netstat",
    usage: "netstat",
    description: "Listar las conexiones virtuales del equipo.",
    example: "netstat",
    run: netstat,
  },
  {
    name: "curl",
    usage: "curl <url-http-o-https>",
    description: "Ver los encabezados y el contenido de una respuesta HTTP simulada.",
    example: "curl https://intranet.nodoseguro.test/",
    run: curl,
  },
  {
    name: "whois",
    usage: "whois <dominio>",
    description: "Consultar el titular y las fechas de un dominio ficticio.",
    example: "whois acme.example",
    run: whois,
  },
  {
    name: "pwd",
    usage: "pwd",
    description: "Mostrar el directorio virtual actual.",
    example: "pwd",
    run: pwd,
  },
  {
    name: "ssh",
    usage: "ssh <servidor-virtual> [ficha]",
    description: "Abrir una sesión virtual del juego.",
    example: "ssh acme.example",
    run: ssh,
  },
  {
    name: "trace",
    usage: "trace",
    description: "Mostrar el nivel de rastreo del juego.",
    example: "trace",
    run: trace,
  },
  {
    name: "whoami",
    usage: "whoami",
    description: "Mostrar el nombre del jugador.",
    example: "whoami",
    run: whoami,
  },
];
