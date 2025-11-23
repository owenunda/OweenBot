import { SlashCommandBuilder } from "discord.js";

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user"),

    async execute(interaction){
    await interaction.reply(`Command executed by ${interaction.user.username}`) 
    }
}