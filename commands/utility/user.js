import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user"),

    async execute(interaction){
        const lang = await getGuildLanguage(interaction.guildId);
        const user = interaction.user;
        const member = interaction.member;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(t(lang, 'user.title'))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t(lang, 'user.username'), value: user.username, inline: true },
                { name: t(lang, 'user.id'), value: user.id, inline: true },
                { name: t(lang, 'user.created'), value: user.createdAt.toDateString(), inline: true },
                { name: t(lang, 'user.joined'), value: member.joinedAt.toDateString(), inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
}