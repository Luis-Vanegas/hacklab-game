import type { CommandDefinition } from "./shared";
import buy from "./buy";
import cat from "./cat";
import head from "./head";
import tail from "./tail";
import grep from "./grep";
import find from "./find";
import wc from "./wc";
import echo from "./echo";
import touch from "./touch";
import mkdir from "./mkdir";
import file from "./file";
import base64 from "./base64";
import sha256sum from "./sha256sum";
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
import date from "./date";
import hostname from "./hostname";
import kill from "./kill";
import pista from "./pista";
import ps from "./ps";
import sudo from "./sudo";
import uname from "./uname";
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
    name: "head",
    usage: "head [-n <número>] <archivo>",
    description: "Mostrar las primeras líneas de un archivo virtual.",
    example: "head -n 5 /var/log/auth.log",
    run: head,
  },
  {
    name: "tail",
    usage: "tail [-n <número>] <archivo>",
    description: "Mostrar las últimas líneas de un archivo virtual.",
    example: "tail -n 5 /var/log/auth.log",
    run: tail,
  },
  {
    name: "grep",
    usage: "grep [-i] [-c] <patrón> <archivo>",
    description: "Buscar texto literal o contar las líneas que lo contienen.",
    example: "grep -c Failed /var/log/auth.log",
    run: grep,
  },
  {
    name: "find",
    usage: "find <ruta> -name <patrón>",
    description:
      "Buscar nombres con patrones de asterisco e interrogación y mostrar sus rutas virtuales.",
    example: 'find /home/user -name "*.txt"',
    run: find,
  },
  {
    name: "wc",
    usage: "wc [-l] <archivo>",
    description: "Contar saltos de línea, palabras y bytes UTF-8.",
    example: "wc -l notes",
    run: wc,
  },
  {
    name: "echo",
    usage: "echo <texto>",
    description: "Mostrar el texto en la terminal.",
    example: "echo Hola Medellín",
    run: echo,
  },
  {
    name: "touch",
    usage: "touch <archivo>",
    description: "Crear un archivo virtual vacío si no existe.",
    example: "touch bitacora.txt",
    run: touch,
  },
  {
    name: "mkdir",
    usage: "mkdir <directorio>",
    description: "Crear un directorio virtual si no existe.",
    example: "mkdir informes",
    run: mkdir,
  },
  {
    name: "file",
    usage: "file <archivo>",
    description: "Distinguir texto, scripts, binarios y directorios.",
    example: "file /home/user/.bashrc",
    run: file,
  },
  {
    name: "base64",
    usage: "base64 [-d] <texto>",
    description: "Codificar o decodificar texto UTF-8 en Base64.",
    example: "base64 -d SG9sYQ==",
    run: base64,
  },
  {
    name: "sha256sum",
    usage: "sha256sum <archivo>",
    description: "Calcular la suma SHA-256 de un archivo virtual.",
    example: "sha256sum notes",
    run: sha256sum,
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
    name: "date",
    usage: "date",
    description: "Mostrar la fecha del juego.",
    example: "date",
    run: date,
  },
  {
    name: "hostname",
    usage: "hostname [-a]",
    description: "Identificar la estación virtual y consultar su alias.",
    example: "hostname -a",
    run: hostname,
  },
  {
    name: "kill",
    usage: "kill <pid>",
    description: "Detener un proceso virtual mediante su identificador.",
    example: "kill 4444",
    run: kill,
  },
  {
    name: "pista",
    usage: "pista",
    description: "Pedir la siguiente pista del objetivo actual.",
    example: "pista",
    run: pista,
  },
  {
    name: "ps",
    usage: "ps",
    description: "Listar los procesos activos de la estación virtual.",
    example: "ps",
    run: ps,
  },
  {
    name: "sudo",
    usage: "sudo <comando>",
    description: "Simular una comprobación de privilegios.",
    example: "sudo ps",
    run: sudo,
  },
  {
    name: "uname",
    usage: "uname [-a]",
    description: "Identificar el sistema operativo virtual.",
    example: "uname -a",
    run: uname,
  },
  {
    name: "whoami",
    usage: "whoami",
    description: "Mostrar el nombre del jugador.",
    example: "whoami",
    run: whoami,
  },
];
