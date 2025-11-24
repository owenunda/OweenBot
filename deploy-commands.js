/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEPLOY-COMMANDS.JS - Registro de Slash Commands en Discord
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script registra todos los comandos del bot en Discord.
 * Debe ejecutarse cada vez que:
 * - Se crea un nuevo comando
 * - Se modifica la estructura de un comando (nombre, opciones, descripción)
 * - Se elimina un comando
 * 
 * IMPORTANTE: No es necesario ejecutarlo si solo cambias la lógica interna
 * del comando (función execute), solo cuando cambias la definición (data).
 * 
 * Ejecución: node deploy-commands.js
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTACIONES
// ═══════════════════════════════════════════════════════════════════════════

import { REST, Routes } from 'discord.js';  // API de Discord para registrar comandos
import 'dotenv/config';                      // Carga variables de entorno
import fs from 'node:fs';                    // Sistema de archivos
import path from 'node:path';                // Manejo de rutas
import { pathToFileURL, fileURLToPath } from 'node:url';  // Conversión de rutas

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CLIENT_ID: ID de la aplicación del bot (se obtiene del Discord Developer Portal)
 * TOKEN: Token de autenticación del bot (necesario para la API)
 */
const clientId = process.env.NODE_ENV === 'development'
	? process.env.CLIENT_ID_DEV
	: process.env.CLIENT_ID;
const token = process.env.NODE_ENV === 'development'
	? process.env.TOKEN_DEV
	: process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const nodeEnv = process.env.NODE_ENV;
// Obtiene el directorio actual del script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// RECOPILACIÓN DE COMANDOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Array que contendrá todos los comandos en formato JSON
 * para ser enviados a la API de Discord
 */
const commands = [];

/**
 * Función recursiva para explorar carpetas y encontrar todos los archivos .js
 * @param {string} dir - Directorio a explorar
 * @returns {Array<string>} - Array con todas las rutas de archivos .js encontrados
 */
function getAllCommandFiles(dir) {
	const files = [];
	const items = fs.readdirSync(dir, { withFileTypes: true });

	for (const item of items) {
		const fullPath = path.join(dir, item.name);

		if (item.isDirectory()) {
			// Si es una carpeta, explora recursivamente
			// Ignora carpetas especiales y subcarpetas de comandos RPG
			if (!['node_modules', '.git', 'json', 'character', 'gameplay', 'info', 'items'].includes(item.name)) {
				files.push(...getAllCommandFiles(fullPath));
			}
		} else if (item.isFile() && item.name.endsWith('.js')) {
			// Si es un archivo .js, agrégalo
			files.push(fullPath);
		}
	}

	return files;
}

// Ruta a la carpeta que contiene todas las categorías de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = getAllCommandFiles(foldersPath);

/**
 * Procesa cada archivo de comando:
 * 1. Importa el módulo
 * 2. Valida su estructura
 * 3. Convierte la definición a JSON
 * 4. Lo agrega al array de comandos
 */
for (const filePath of commandFiles) {
	// Convierte la ruta a URL para importación dinámica
	const moduleUrl = pathToFileURL(filePath).href;
	const imported = await import(moduleUrl);
	const command = imported.default ?? imported;

	// Valida que el comando tenga las propiedades requeridas
	if ('data' in command && 'execute' in command) {
		/**
		 * Convierte el SlashCommandBuilder a JSON
		 * Este formato es el que espera la API de Discord
		 */
		commands.push(command.data.toJSON());
		console.log(`[OK] Comando cargado: ${command.data.name} (${filePath})`);
	} else {
		console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene la propiedad requerida "data" o "execute".`);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRO EN DISCORD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crea una instancia del cliente REST de Discord
 * y la autentica con el token del bot
 */
const rest = new REST().setToken(token);

/**
 * IIFE (Immediately Invoked Function Expression)
 * Se ejecuta automáticamente al correr el script
 */
(async () => {
	try {
		console.log(`Empezando a actualizar ${commands.length} comandos de la aplicación (/) - deploy-commands.js:41`);

		/**
		 * Envía los comandos a Discord usando la API REST
		 * 
		 * PUT Routes.applicationCommands():
		 * - Registra comandos GLOBALMENTE (disponibles en todos los servidores)
		 * - REEMPLAZA completamente la lista anterior de comandos
		 * - Puede tardar hasta 1 hora en propagarse
		 * 
		 * Alternativa para testing (más rápido):
		 * Routes.applicationGuildCommands(clientId, guildId)
		 * - Registra comandos solo en un servidor específico
		 * - Se actualiza instantáneamente
		 */

		if (nodeEnv === 'development') {
			const data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
			console.log(`Se recargaron con éxito en el servidor ${guildId} ${data.length} comandos de la aplicación (/) - deploy-commands.js:46`);
		} else {
			const data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
			console.log(`Se recargaron con éxito globalmente ${data.length} comandos de la aplicación (/) - deploy-commands.js:49`);
		}



	} catch (error) {
		/**
		 * Posibles errores:
		 * - Token inválido
		 * - CLIENT_ID incorrecto
		 * - Comando con estructura inválida
		 * - Problemas de red
		 */
		console.error(error);
	}
})();