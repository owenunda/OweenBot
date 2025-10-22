import { Events } from 'discord.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`¡Listo! Conectado como ${client.user.tag}`);
		
	},
};