import { SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from 'node:timers/promises';

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("hola-pepe")
    .setDescription("te responde con un hola :D"),

    async execute(interaction){
    await interaction.reply({ content: 'Hoqa!'})
    await wait(2000)
    await interaction.editReply("Escribí mal, era: Hola!")

    }
    
}