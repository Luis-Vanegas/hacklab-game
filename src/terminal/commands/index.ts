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
import python from "./python";
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
    category: "juego",
    learn: "Relacionas los créditos y el nivel con las herramientas de la partida.",
    realWorld:
      "En un equipo de trabajo, sirve planificar qué herramientas hacen falta antes de empezar.",
    unlockRank: "script_kiddie",
    usage: "buy <herramienta>",
    description: "Comprar una herramienta del juego.",
    example: "buy nmap",
    run: buy,
  },
  {
    name: "cat",
    category: "archivos",
    learn: "Lees un archivo de texto desde la terminal virtual.",
    realWorld: "Se consulta contenido breve, como una nota o una configuración de lectura.",
    unlockRank: "script_kiddie",
    usage: "cat <archivo>",
    description: "Leer un archivo virtual.",
    example: "cat notes",
    run: cat,
  },
  {
    name: "cd",
    category: "archivos",
    learn: "Cambias de carpeta con rutas relativas o absolutas.",
    realWorld: "Permite moverte al directorio donde vas a trabajar.",
    unlockRank: "script_kiddie",
    usage: "cd [ruta]",
    description: "Cambiar de directorio virtual; sin ruta vuelve a /home/user.",
    example: "cd /etc",
    run: cd,
  },
  {
    name: "clear",
    category: "sistema",
    learn: "Limpias lo que se ve en la terminal y conservas el historial de la sesión.",
    realWorld: "Ayuda a despejar la pantalla antes de empezar otra tarea.",
    unlockRank: "script_kiddie",
    usage: "clear",
    description: "Limpiar la pantalla de la terminal.",
    example: "clear",
    run: clear,
  },
  {
    name: "crack",
    category: "seguridad",
    learn: "Resuelves un desafío de ficha ya preparado en el juego.",
    realWorld:
      "En formación se usan ejercicios controlados para explicar la seguridad de las credenciales.",
    unlockRank: "hacker",
    usage: "crack ficha",
    description: "Resolver el desafío de ficha escrito para la misión.",
    example: "crack ficha",
    run: crack,
  },
  {
    name: "download",
    category: "archivos",
    learn: "Copias un archivo ficticio a tu directorio virtual.",
    realWorld:
      "Copiar evidencias de un sistema autorizado ayuda a analizarlas sin alterar el original.",
    unlockRank: "script_kiddie",
    usage: "download <ruta-virtual-absoluta>",
    description: "Copiar un archivo ficticio al directorio del jugador.",
    example: "download /archivo.txt",
    run: download,
  },
  {
    name: "head",
    category: "archivos",
    learn: "Lees las primeras líneas de un archivo y controlas cuántas se muestran.",
    realWorld:
      "Es útil para revisar encabezados y muestras pequeñas antes de abrir archivos largos.",
    unlockRank: "script_kiddie",
    usage: "head [-n <número>] <archivo>",
    description: "Mostrar las primeras líneas de un archivo virtual.",
    example: "head -n 5 /var/log/auth.log",
    run: head,
  },
  {
    name: "tail",
    category: "archivos",
    learn: "Lees las últimas líneas de un archivo y controlas cuántas se muestran.",
    realWorld: "Sirve para consultar los eventos más recientes en un registro.",
    unlockRank: "script_kiddie",
    usage: "tail [-n <número>] <archivo>",
    description: "Mostrar las últimas líneas de un archivo virtual.",
    example: "tail -n 5 /var/log/auth.log",
    run: tail,
  },
  {
    name: "grep",
    category: "archivos",
    learn: "Filtras o cuentas las líneas que contienen un texto literal.",
    realWorld: "Ayuda a localizar un evento, una IP o una palabra dentro de un registro.",
    unlockRank: "script_kiddie",
    usage: "grep [-i] [-c] <patrón> <archivo>",
    description: "Buscar texto literal o contar las líneas que lo contienen.",
    example: "grep -c Failed /var/log/auth.log",
    run: grep,
  },
  {
    name: "find",
    category: "archivos",
    learn: "Buscas nombres de archivos y carpetas con patrones en un árbol de directorios.",
    realWorld:
      "Sirve para localizar archivos cuando recuerdas parte del nombre y no su ruta exacta.",
    unlockRank: "script_kiddie",
    usage: "find <ruta> -name <patrón>",
    description:
      "Buscar nombres con patrones de asterisco e interrogación y mostrar sus rutas virtuales.",
    example: 'find /home/user -name "*.txt"',
    run: find,
  },
  {
    name: "wc",
    category: "archivos",
    learn: "Cuentas líneas, palabras o bytes de un archivo virtual.",
    realWorld: "Permite cuantificar registros y verificar el tamaño de una entrada de datos.",
    unlockRank: "script_kiddie",
    usage: "wc [-l] <archivo>",
    description: "Contar saltos de línea, palabras y bytes UTF-8.",
    example: "wc -l notes",
    run: wc,
  },
  {
    name: "echo",
    category: "archivos",
    learn: "Muestras un texto de entrada en la terminal.",
    realWorld: "Es común para mostrar mensajes de avance al ejecutar tareas o scripts.",
    unlockRank: "script_kiddie",
    usage: "echo <texto> [> <archivo-virtual>]",
    description: "Mostrar el texto en la terminal.",
    example: "echo Hola Medellín",
    run: echo,
  },
  {
    name: "touch",
    category: "archivos",
    learn: "Creas un archivo virtual vacío sin alterar el contenido de uno existente.",
    realWorld:
      "Se usa para preparar archivos o actualizar marcas de tiempo en tareas de automatización.",
    unlockRank: "script_kiddie",
    usage: "touch <archivo>",
    description: "Crear un archivo virtual vacío si no existe.",
    example: "touch bitacora.txt",
    run: touch,
  },
  {
    name: "mkdir",
    category: "archivos",
    learn: "Creas un directorio donde su carpeta padre ya existe.",
    realWorld: "Sirve para organizar el trabajo y separar entradas, resultados o evidencias.",
    unlockRank: "script_kiddie",
    usage: "mkdir <directorio>",
    description: "Crear un directorio virtual si no existe.",
    example: "mkdir informes",
    run: mkdir,
  },
  {
    name: "file",
    category: "archivos",
    learn: "Distingues texto, scripts y datos binarios en un archivo virtual.",
    realWorld: "Comprobar el tipo de un archivo ayuda a elegir cómo abrirlo o procesarlo.",
    unlockRank: "script_kiddie",
    usage: "file <archivo>",
    description: "Distinguir texto, scripts, binarios y directorios.",
    example: "file /home/user/.bashrc",
    run: file,
  },
  {
    name: "base64",
    category: "archivos",
    learn: "Codificas y decodificas texto en Base64.",
    realWorld: "Base64 permite transportar datos binarios en formatos que esperan texto.",
    unlockRank: "script_kiddie",
    usage: "base64 [-d] <texto>",
    description: "Codificar o decodificar texto UTF-8 en Base64.",
    example: "base64 -d SG9sYQ==",
    run: base64,
  },
  {
    name: "sha256sum",
    category: "seguridad",
    learn: "Calculas una huella SHA-256 del contenido de un archivo virtual.",
    realWorld:
      "Comparar huellas permite verificar la integridad de un archivo o una copia de evidencia.",
    unlockRank: "script_kiddie",
    usage: "sha256sum <archivo>",
    description: "Calcular la suma SHA-256 de un archivo virtual.",
    example: "sha256sum notes",
    run: sha256sum,
  },
  {
    name: "help",
    category: "juego",
    learn: "Identificas los comandos disponibles en la terminal.",
    realWorld:
      "La ayuda de una herramienta permite descubrir funciones y opciones antes de usarla.",
    unlockRank: "script_kiddie",
    usage: "help",
    description: "Listar los comandos registrados por categoría.",
    example: "help",
    run: help,
  },
  {
    name: "history",
    category: "sistema",
    learn: "Consultas los comandos que se ejecutaron antes en la sesión.",
    realWorld:
      "El historial ayuda a recordar los pasos de una investigación o reproducir un diagnóstico.",
    unlockRank: "script_kiddie",
    usage: "history",
    description: "Listar los comandos ejecutados en la sesión.",
    example: "history",
    run: history,
  },
  {
    name: "ls",
    category: "archivos",
    learn: "Listas archivos y carpetas, con la opción de mostrar entradas ocultas.",
    realWorld: "Sirve para inspeccionar lo que hay en un directorio antes de operar sobre él.",
    unlockRank: "script_kiddie",
    usage: "ls [-a] [ruta]",
    description: "Listar archivos y carpetas virtuales.",
    example: "ls -a /home/user",
    run: ls,
  },
  {
    name: "man",
    category: "juego",
    learn: "Consultas el uso, un ejemplo, la habilidad y el rango de un comando.",
    realWorld: "Los manuales permiten verificar la sintaxis y conocer opciones sin adivinarlas.",
    unlockRank: "script_kiddie",
    usage: "man <comando>",
    description: "Consultar el manual de un comando.",
    example: "man ls",
    run: man,
  },
  {
    name: "nmap",
    category: "red",
    learn: "Interpretas el inventario de puertos de un servidor ficticio.",
    realWorld:
      "En una red autorizada se contrasta el inventario de servicios con lo que debe estar publicado.",
    unlockRank: "script_kiddie",
    usage: "nmap <servidor-virtual>",
    description: "Leer el inventario de puertos de la misión.",
    example: "nmap acme.example",
    run: nmap,
  },
  {
    name: "ipconfig",
    category: "red",
    learn: "Lees las interfaces, la IP, la máscara, el gateway y el DNS del equipo virtual.",
    realWorld:
      "Conocer la configuración de red ayuda a detectar errores de conexión o de direccionamiento.",
    unlockRank: "script_kiddie",
    aliases: ["ifconfig"],
    usage: "ipconfig",
    description: "Mostrar la configuración de red del equipo. Alias: ifconfig.",
    example: "ipconfig",
    run: ipconfig,
  },
  {
    name: "ping",
    category: "red",
    learn: "Interpretas tiempos de respuesta y pérdida de paquetes en la red virtual.",
    realWorld: "Sirve como comprobación inicial de conectividad en una red autorizada.",
    unlockRank: "script_kiddie",
    usage: "ping <host>",
    description: "Comprobar si un equipo simulado responde en la red.",
    example: "ping 10.20.0.1",
    run: ping,
  },
  {
    name: "nslookup",
    category: "red",
    learn: "Buscas la dirección asociada a un nombre en el DNS virtual.",
    realWorld: "Permite comprobar si un nombre de dominio resuelve hacia el destino esperado.",
    unlockRank: "script_kiddie",
    usage: "nslookup <dominio>",
    description: "Consultar la dirección de un dominio en el DNS virtual.",
    example: "nslookup intranet.nodoseguro.test",
    run: nslookup,
  },
  {
    name: "traceroute",
    category: "red",
    learn: "Identificas los saltos del recorrido virtual hasta un destino.",
    realWorld: "Ayuda a acotar dónde se interrumpe o se retrasa una ruta de red.",
    unlockRank: "script_kiddie",
    usage: "traceroute <host>",
    description: "Mostrar los saltos simulados hasta un equipo.",
    example: "traceroute archivo.example",
    run: traceroute,
  },
  {
    name: "netstat",
    category: "red",
    learn: "Relacionas direcciones, puertos y estados de conexiones virtuales.",
    realWorld:
      "Revisar conexiones ayuda a detectar comunicaciones inesperadas en un equipo administrado.",
    unlockRank: "script_kiddie",
    usage: "netstat",
    description: "Listar las conexiones virtuales del equipo.",
    example: "netstat",
    run: netstat,
  },
  {
    name: "curl",
    category: "red",
    learn: "Lees una respuesta HTTP ficticia y distingues sus encabezados del cuerpo.",
    realWorld: "Se usa para verificar cómo responde un servicio web autorizado.",
    unlockRank: "script_kiddie",
    usage: "curl <url-http-o-https>",
    description: "Ver los encabezados y el contenido de una respuesta HTTP simulada.",
    example: "curl https://intranet.nodoseguro.test/",
    run: curl,
  },
  {
    name: "whois",
    category: "red",
    learn: "Consultas el titular y las fechas de registro de un dominio ficticio.",
    realWorld: "La información de registro puede ayudar a identificar a un responsable de dominio.",
    unlockRank: "script_kiddie",
    usage: "whois <dominio>",
    description: "Consultar el titular y las fechas de un dominio ficticio.",
    example: "whois acme.example",
    run: whois,
  },
  {
    name: "pwd",
    category: "archivos",
    learn: "Reconoces la ruta absoluta del directorio actual.",
    realWorld: "Comprobar la ubicación evita operar sobre archivos en la carpeta equivocada.",
    unlockRank: "script_kiddie",
    usage: "pwd",
    description: "Mostrar el directorio virtual actual.",
    example: "pwd",
    run: pwd,
  },
  {
    name: "python",
    category: "sistema",
    learn: "Lees scripts cortos y comparas su salida simulada con una herramienta de la terminal.",
    realWorld:
      "Python ayuda a automatizar tareas repetitivas como resumir registros o verificar archivos.",
    unlockRank: "script_kiddie",
    usage: "python <script-virtual>",
    description: "Mostrar la salida simulada de un ejemplo de Python.",
    example: "python ~/scripts/contar_fallidos.py",
    run: python,
  },
  {
    name: "ssh",
    category: "red",
    learn: "Abres una sesión en un servidor virtual del contrato.",
    realWorld: "SSH permite administrar equipos de forma remota cuando tienes acceso autorizado.",
    unlockRank: "script_kiddie",
    usage: "ssh <servidor-virtual> [ficha]",
    description: "Abrir una sesión virtual del juego.",
    example: "ssh acme.example",
    run: ssh,
  },
  {
    name: "trace",
    category: "juego",
    learn: "Lees el nivel de rastreo de la partida.",
    realWorld: "En un entorno real, un tablero de alertas ayuda a priorizar señales de riesgo.",
    unlockRank: "script_kiddie",
    usage: "trace",
    description: "Mostrar el nivel de rastreo del juego.",
    example: "trace",
    run: trace,
  },
  {
    name: "date",
    category: "sistema",
    learn: "Consultas la fecha y hora de la estación virtual.",
    realWorld: "Revisar la hora ayuda a correlacionar registros de distintos equipos.",
    unlockRank: "script_kiddie",
    usage: "date",
    description: "Mostrar la fecha del juego.",
    example: "date",
    run: date,
  },
  {
    name: "hostname",
    category: "sistema",
    learn: "Identificas la estación y su alias virtual.",
    realWorld: "El nombre del equipo ayuda a documentar en qué máquina se hizo un cambio.",
    unlockRank: "script_kiddie",
    usage: "hostname [-a]",
    description: "Identificar la estación virtual y consultar su alias.",
    example: "hostname -a",
    run: hostname,
  },
  {
    name: "kill",
    category: "sistema",
    learn: "Detienes un proceso ficticio por su identificador y compruebas el resultado.",
    realWorld: "Con autorización, un administrador puede detener un proceso que afecta al equipo.",
    unlockRank: "script_kiddie",
    usage: "kill <pid>",
    description: "Detener un proceso virtual mediante su identificador.",
    example: "kill 4444",
    run: kill,
  },
  {
    name: "pista",
    category: "juego",
    learn: "Pides ayuda gradual para el objetivo activo.",
    realWorld:
      "Los procedimientos y guías de un equipo orientan el diagnóstico con pasos comprobables.",
    unlockRank: "script_kiddie",
    usage: "pista",
    description: "Pedir la siguiente pista del objetivo actual.",
    example: "pista",
    run: pista,
  },
  {
    name: "ps",
    category: "sistema",
    learn: "Inspeccionas los procesos activos y sus identificadores en la estación virtual.",
    realWorld:
      "Revisar los procesos ayuda a reconocer programas esperados y señales que requieren análisis.",
    unlockRank: "script_kiddie",
    usage: "ps",
    description: "Listar los procesos activos de la estación virtual.",
    example: "ps",
    run: ps,
  },
  {
    name: "sudo",
    category: "seguridad",
    learn: "Reconoces qué ocurre cuando tu cuenta no tiene privilegios elevados.",
    realWorld:
      "Los permisos de administración protegen cambios que afectan al sistema o a otros usuarios.",
    unlockRank: "script_kiddie",
    usage: "sudo <comando>",
    description: "Simular una comprobación de privilegios.",
    example: "sudo ps",
    run: sudo,
  },
  {
    name: "uname",
    category: "sistema",
    learn: "Consultas el sistema y la arquitectura de la estación virtual.",
    realWorld: "Conocer la plataforma ayuda a elegir herramientas compatibles.",
    unlockRank: "script_kiddie",
    usage: "uname [-a]",
    description: "Identificar el sistema operativo virtual.",
    example: "uname -a",
    run: uname,
  },
  {
    name: "whoami",
    category: "sistema",
    learn: "Compruebas qué usuario está activo en la terminal.",
    realWorld: "Identificar tu cuenta ayuda a entender qué permisos tienes en una sesión.",
    unlockRank: "script_kiddie",
    usage: "whoami",
    description: "Mostrar el nombre del jugador.",
    example: "whoami",
    run: whoami,
  },
];
