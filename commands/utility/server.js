import { SlashCommandBuilder } from 'discord.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`El nombre del servidor es ${interaction.guild.name} y tiene ${interaction.guild.memberCount} miembros.`);
	},
};

