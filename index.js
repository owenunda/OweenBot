/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OWEENBOT - Bot de Discord con servidor Express integrado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo es el punto de entrada principal del bot. Se encarga de:
 * 1. Iniciar un servidor Express para mantener el bot activo (útil en hosting gratuito)
 * 2. Configurar el cliente de Discord
 * 3. Cargar dinámicamente todos los comandos desde las carpetas
 * 4. Cargar dinámicamente todos los eventos desde la carpeta /events
 * 5. Iniciar la conexión con Discord
 * 
 * Estructura del proyecto:
 * - /commands/: Carpetas categorizadas con comandos del bot (fun, moderation, utility)
 * - /events/: Manejadores de eventos de Discord (ready, interactionCreate)
 * - /page/: Archivos HTML para la landing page
 * - /assets/: Recursos estáticos (imágenes, etc.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTACIONES DE MÓDULOS
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'node:fs';              // Sistema de archivos para leer carpetas/archivos
import path from 'node:path';          // Manejo de rutas de archivos multiplataforma
import { pathToFileURL, fileURLToPath } from 'node:url';  // Conversión de rutas para ES modules
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';  // Librería de Discord
import express from "express";         // Framework web para el servidor HTTP
import 'dotenv/config';                // Carga variables de entorno desde .env

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ═══════════════════════════════════════════════════════════════════════════
// El servidor Express sirve una landing page y mantiene el bot activo en servicios
// de hosting gratuitos que requieren que la aplicación responda a peticiones HTTP

const app = express();
const PORT = process.env.PORT || 3000;  // Puerto desde variable de entorno o 3000 por defecto

/**
 * Middleware: Sirve archivos estáticos desde la carpeta /assets
 * Permite acceder a imágenes y recursos mediante URLs como: http://localhost:3000/assets/imgs/logo.png
 */
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

/**
 * Ruta principal (GET /)
 * Muestra la landing page del bot con información, estadísticas, etc.
 */
app.get("/", (req, res) => {
	const filePath = path.join(process.cwd(), 'page', 'index.html');
	res.sendFile(filePath);
});

/**
 * Inicia el servidor Express en el puerto especificado
 * Esto mantiene el proceso activo y permite monitoreo externo
 */
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} - index.js:59`));

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL CLIENTE DE DISCORD
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Obtiene el directorio actual del archivo
 * Necesario porque en ES modules __dirname no existe por defecto
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Crea la instancia del cliente de Discord
 * Intents: Define qué eventos puede recibir el bot
 * - GatewayIntentBits.Guilds: Permite recibir información de servidores (obligatorio para slash commands)
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/**
 * Collection para almacenar cooldowns activos de comandos
 * Estructura: Map<nombreComando, Map<userId, timestamp>>
 * Evita que usuarios spameen comandos
 */
client.cooldowns = new Collection();

/**
 * Collection para almacenar todos los comandos cargados
 * Estructura: Map<nombreComando, objetoComando>
 * Permite acceso rápido a los comandos por nombre
 */
client.commands = new Collection();

// ═══════════════════════════════════════════════════════════════════════════
// CARGA DINÁMICA DE COMANDOS
// ═══════════════════════════════════════════════════════════════════════════

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);  // Lee todas las carpetas en /commands

/**
 * Itera por cada carpeta de categoría (fun, moderation, utility, etc.)
 * y carga todos los archivos .js como comandos
 */
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	
	// Filtra solo archivos JavaScript, ignora subcarpetas y otros archivos
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	
	// Procesa cada archivo de comando individualmente
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		
		// Convierte la ruta del archivo a URL para importación dinámica (requerido en ES modules)
		const moduleUrl = pathToFileURL(filePath).href;
		const imported = await import(moduleUrl);
		
		// Soporta tanto export default como exports nombrados
		const command = imported.default ?? imported;
		
		// Valida que el comando tenga la estructura correcta
		if ('data' in command && 'execute' in command) {
			/**
			 * Agrega metadata al comando para funcionalidades avanzadas:
			 * - category: Nombre de la carpeta (ej: "fun", "moderation")
			 * - fileName: Nombre del archivo sin extensión (necesario para reload)
			 */
			command.category = command.category ?? folder;
			command.fileName = command.fileName ?? path.parse(file).name;
			
			// Registra el comando en la colección usando su nombre como clave
			client.commands.set(command.data.name, command);
		} else {
			// Advertencia si un archivo no tiene la estructura correcta de comando
			console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene la propiedad requerida "data" o "execute". - index.js:134`);
		}
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGA DINÁMICA DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

/**
 * Itera por cada archivo de evento y lo registra en el cliente
 * Soporta eventos que se ejecutan una sola vez (once) o múltiples veces (on)
 */
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const moduleUrl = pathToFileURL(filePath).href;
	const imported = await import(moduleUrl);
	const event = imported.default ?? imported;
	
	/**
	 * Registra el evento según su configuración:
	 * - once: true -> Se ejecuta solo una vez (ej: ready)
	 * - once: false o undefined -> Se ejecuta cada vez que ocurre (ej: interactionCreate)
	 */
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	
	console.log(`[EVENTO] Cargado: ${event.name} - index.js:167`);
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIO DE SESIÓN DEL BOT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Conecta el bot a Discord usando el token almacenado en variables de entorno
 * El token se debe guardar en el archivo .env como: TOKEN=tu_token_aqui
 * NUNCA compartas tu token públicamente
 */
client.login(process.env.TOKEN);