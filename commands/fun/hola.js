const {SlashCommandBuilder} = require("discord.js")
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("hola")
    .setDescription("te responde con un hola :D"),

    async execute(interaction){
        await interaction.reply({ content: 'Hoqa!'})
        await wait(2000)
        await interaction.editReply("escribi mal era, Hola!")

    }
    
}