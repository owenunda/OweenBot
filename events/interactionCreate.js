/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENTO: InteractionCreate
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este evento se dispara cada vez que un usuario interactúa con el bot
 * (comandos slash, botones, menús desplegables, modales, etc.)
 * 
 * Funcionalidades implementadas:
 * - Validación de comandos
 * - Sistema de cooldowns (tiempo de espera entre usos)
 * - Manejo de errores con respuestas al usuario
 * - Ejecución segura de comandos
 */

import { Events, Collection } from 'discord.js';

export default {
	/**
	 * Nombre del evento que se está escuchando
	 * Se usa automáticamente cuando se carga este archivo
	 */
	name: Events.InteractionCreate,
	
	/**
	 * Función que se ejecuta cuando ocurre una interacción
	 * @param {Interaction} interaction - Objeto de interacción de Discord
	 */
	async execute(interaction) {
		// ═══════════════════════════════════════════════════════════════════════
		// VALIDACIÓN DE TIPO DE INTERACCIÓN
		// ═══════════════════════════════════════════════════════════════════════
		
		// Solo procesa comandos de tipo slash (/comando)
		// Ignora otros tipos de interacciones como botones o menús
		if (!interaction.isChatInputCommand()) return;

		// Busca el comando en la colección del cliente
		const command = interaction.client.commands.get(interaction.commandName);

		// Si el comando no existe, registra error y termina
		if (!command) {
			console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}. - interactionCreate.js:43`);
			return;
		}

		// ═══════════════════════════════════════════════════════════════════════
		// SISTEMA DE COOLDOWNS (TIEMPO DE ESPERA)
		// ═══════════════════════════════════════════════════════════════════════
		
		const { cooldowns } = interaction.client;

		/**
		 * Si es la primera vez que se usa este comando, crea una nueva Collection
		 * para almacenar los timestamps de usuarios que lo ejecutan
		 */
		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();  // Timestamp actual en milisegundos
		const timestamps = cooldowns.get(command.data.name);  // Collection de usuarios y timestamps
		const defaultCooldownDuration = 3;  // Cooldown por defecto: 3 segundos
		
		/**
		 * Obtiene el cooldown del comando o usa el valor por defecto
		 * Se multiplica por 1000 para convertir segundos a milisegundos
		 */
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

		/**
		 * Verifica si el usuario ya tiene un cooldown activo
		 */
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			// Si el cooldown aún no ha expirado, rechaza la ejecución
			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ 
					content: `Por favor espera, estás en periodo de espera para \`${command.data.name}\`. Podrás usarlo de nuevo <t:${expiredTimestamp}:R>.`, 
					ephemeral: true  // Mensaje visible solo para el usuario
				});
			}
		}

		/**
		 * Registra el timestamp actual para este usuario
		 * y programa su eliminación automática después del cooldown
		 */
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		// ═══════════════════════════════════════════════════════════════════════
		// EJECUCIÓN DEL COMANDO
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENTO: InteractionCreate
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este evento se dispara cada vez que un usuario interactúa con el bot
 * (comandos slash, botones, menús desplegables, modales, etc.)
 * 
 * Funcionalidades implementadas:
 * - Validación de comandos
 * - Sistema de cooldowns (tiempo de espera entre usos)
 * - Manejo de errores con respuestas al usuario
 * - Ejecución segura de comandos
 */

import { Events, Collection } from 'discord.js';

export default {
	/**
	 * Nombre del evento que se está escuchando
	 * Se usa automáticamente cuando se carga este archivo
	 */
	name: Events.InteractionCreate,
	
	/**
	 * Función que se ejecuta cuando ocurre una interacción
	 * @param {Interaction} interaction - Objeto de interacción de Discord
	 */
	async execute(interaction) {
		// ═══════════════════════════════════════════════════════════════════════
		// VALIDACIÓN DE TIPO DE INTERACCIÓN
		// ═══════════════════════════════════════════════════════════════════════
		
		// Solo procesa comandos de tipo slash (/comando)
		// Ignora otros tipos de interacciones como botones o menús
		if (!interaction.isChatInputCommand()) return;

		// Busca el comando en la colección del cliente
		const command = interaction.client.commands.get(interaction.commandName);

		// Si el comando no existe, registra error y termina
		if (!command) {
			console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}. - interactionCreate.js:43`);
			return;
		}

		// ═══════════════════════════════════════════════════════════════════════
		// SISTEMA DE COOLDOWNS (TIEMPO DE ESPERA)
		// ═══════════════════════════════════════════════════════════════════════
		
		const { cooldowns } = interaction.client;

		/**
		 * Si es la primera vez que se usa este comando, crea una nueva Collection
		 * para almacenar los timestamps de usuarios que lo ejecutan
		 */
		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();  // Timestamp actual en milisegundos
		const timestamps = cooldowns.get(command.data.name);  // Collection de usuarios y timestamps
		const defaultCooldownDuration = 3;  // Cooldown por defecto: 3 segundos
		
		/**
		 * Obtiene el cooldown del comando o usa el valor por defecto
		 * Se multiplica por 1000 para convertir segundos a milisegundos
		 */
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

		/**
		 * Verifica si el usuario ya tiene un cooldown activo
		 */
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			// Si el cooldown aún no ha expirado, rechaza la ejecución
			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ 
					content: `Por favor espera, estás en periodo de espera para \`${command.data.name}\`. Podrás usarlo de nuevo <t:${expiredTimestamp}:R>.`, 
					ephemeral: true  // Mensaje visible solo para el usuario
				});
			}
		}

		/**
		 * Registra el timestamp actual para este usuario
		 * y programa su eliminación automática después del cooldown
		 */
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		// ═══════════════════════════════════════════════════════════════════════
		// EJECUCIÓN DEL COMANDO
		// ═══════════════════════════════════════════════════════════════════════
		
		try {
			// Ejecuta la función principal del comando
			await command.execute(interaction);
		}
		catch (error) {
			console.error(`Error al ejecutar ${interaction.commandName}:`, error);
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
				}
				else {
					await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
				}
			} catch (handlerError) {
				console.error('Error al intentar enviar el mensaje de error al usuario:', handlerError);
			}
		}
	},
};