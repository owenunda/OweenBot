import { SlashCommandBuilder } from 'discord.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server'),
	async execute(interaction) {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	},
};
