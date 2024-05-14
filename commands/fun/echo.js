const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('echo')
	.setDescription('Replies with your input!!')
	.addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Replies with your input!")
        .setRequired(true)),

        async execute(interaction){
            const input = await interaction.options.getString("input");
            await interaction.reply(`Dijiste: ${input}`)
        },
}