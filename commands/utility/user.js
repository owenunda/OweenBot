const {SlashCommandBuilder} = require("discord.js")

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Da informacion del usuario"),

    async execute(interaction){
    await interaction.reply(`Comando ejecutado por ${interaction.user.username}`) 
    }
}