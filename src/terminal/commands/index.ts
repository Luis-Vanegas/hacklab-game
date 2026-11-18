import type { CommandDefinition } from "./shared";
import buy from "./buy";
import cat from "./cat";
import cd from "./cd";
import crack from "./crack";
import download from "./download";
import createHelp from "./help";
import ls from "./ls";
import createMan from "./man";
import nmap from "./nmap";
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
