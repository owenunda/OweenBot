/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENTO: ClientReady
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este evento se dispara cuando el bot se conecta exitosamente a Discord
 * y está listo para recibir y procesar eventos.
 * 
 * Es el lugar ideal para:
 * - Inicializar bases de datos
 * - Configurar estados del bot (presencia, actividad)
 * - Cargar datos en caché
 * - Programar tareas periódicas (cronjobs)
 * - Mostrar información de inicio en la consola
 */

import { Events } from 'discord.js';

export default {
	/**
	 * Nombre del evento que se está escuchando
	 */
	name: Events.ClientReady,
	
	/**
	 * once: true indica que este evento solo se ejecuta UNA VEZ
	 * Esto previene que se ejecute múltiples veces si hay reconexiones
	 */
	once: true,
	
	/**
	 * Función que se ejecuta cuando el bot está listo
	 * @param {Client} client - Instancia del cliente de Discord
	 */
	execute(client) {
		/**
		 * client.user.tag contiene el nombre del bot y su discriminador
		 * Ejemplo: "OweenBot#1234"
		 */
		console.log(`¡Listo! Conectado como ${client.user.tag}`);
		
		/**
		 * EJEMPLOS DE CONFIGURACIONES ADICIONALES:
		 * 
		 * // Establecer estado del bot (verde/inactivo/no molestar)
		 * client.user.setStatus('online');
		 * 
		 * // Establecer actividad personalizada
		 * client.user.setActivity('con los comandos', { type: ActivityType.Playing });
		 * // Otros tipos: Watching, Listening, Streaming, Competing
		 * 
		 * // Mostrar estadísticas del bot
		 * console.log(`Servidores: ${client.guilds.cache.size}`);
		 * console.log(`Usuarios: ${client.users.cache.size}`);
		 * console.log(`Comandos cargados: ${client.commands.size}`);
		 */
	},
};