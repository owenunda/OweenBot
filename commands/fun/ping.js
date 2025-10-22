import { SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from 'node:timers/promises';


export default {
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