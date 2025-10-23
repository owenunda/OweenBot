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
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

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

// Ruta a la carpeta que contiene todas las categorías de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);  // Lee carpetas: fun, moderation, utility, etc.

/**
 * Recorre cada categoría de comandos y extrae la definición de cada comando
 */
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	
	// Filtra solo archivos .js, ignora subcarpetas (como /json)
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	
	/**
	 * Procesa cada archivo de comando:
	 * 1. Importa el módulo
	 * 2. Valida su estructura
	 * 3. Convierte la definición a JSON
	 * 4. Lo agrega al array de comandos
	 */
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		
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
		} else {
			console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene la propiedad requerida "data" o "execute". - deploy-commands.js:30`);
		}
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
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Se recargaron con éxito ${data.length} comandos de la aplicación (/) - deploy-commands.js:49`);
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