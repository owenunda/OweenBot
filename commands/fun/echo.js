const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replica tu entrada.')
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Replica con tu entrada.")
                .setRequired(true)),

    async execute(interaction) {
        const input = await interaction.options.getString("input");
        await interaction.reply(`Dijiste: ${input}`)
    },
}