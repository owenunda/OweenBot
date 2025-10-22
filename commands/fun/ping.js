const {SlashCommandBuilder} = require("discord.js")
const wait = require('node:timers/promises').setTimeout;


module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Te dice pong!!"),

    async execute(interaction){
    await interaction.reply("pong!!")
    await wait(4000)
    await interaction.followUp('otro pong!!');
    }
}