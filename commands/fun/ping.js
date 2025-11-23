import { SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from 'node:timers/promises';
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Te dice pong!!"),

    async execute(interaction){
        const lang = await getGuildLanguage(interaction.guildId);
        await interaction.reply(t(lang, 'ping.pong'));
        await wait(4000)
        await interaction.followUp(t(lang, 'ping.pong2'));
    }
}