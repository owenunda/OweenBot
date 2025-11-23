import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('infobot')
    .setDescription('General information about the bot'),

  async execute(interaction) {
    const lang = await getGuildLanguage(interaction.guildId);
    const botUser = interaction.client.user;
    const botUptime = interaction.client.uptime;
    const uptimeSeconds = Math.floor((botUptime / 1000) % 60);
    const uptimeMinutes = Math.floor((botUptime / (1000 * 60)) % 60);
    const uptimeHours = Math.floor((botUptime / (1000 * 60 * 60)) % 24);
    const uptimeDays = Math.floor(botUptime / (1000 * 60 * 60 * 24));

    const embed = new EmbedBuilder()
        .setColor('#00D9FF')
        .setTitle(t(lang, 'infobot.title'))
        .setDescription(t(lang, 'infobot.desc'))
        .addFields(
            { name: '🤖 Name', value: botUser.username, inline: true },
            { name: '🆔 ID', value: botUser.id, inline: true },
            { name: `⏱️ ${t(lang, 'infobot.uptime')}`, value: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`, inline: true },
            { name: '📅 Created', value: botUser.createdAt.toDateString(), inline: true },
            { name: `👨‍💻 ${t(lang, 'infobot.dev')}`, value: 'oweenunda#9782\nusername: manticora', inline: true },
            { name: '📦 Version', value: '1.0.0', inline: true },
            { name: `📚 ${t(lang, 'infobot.lib')}`, value: 'discord.js', inline: true },
            { name: '🌐 Hosting', value: 'Koyeb', inline: true },
            { name: `👥 ${t(lang, 'infobot.servers')}`, value: `${interaction.client.guilds.cache.size}`, inline: true },
            { name: `👤 ${t(lang, 'infobot.users')}`, value: `${interaction.client.users.cache.size}`, inline: true },
            { name: '🔗 GitHub', value: '[Link](https://github.com/owenunda/OweenBot/)', inline: true },
            { name: '🌐 Website', value: '[Link](https://oweenbot.oween.software/)', inline: true }
        )
        .setThumbnail(botUser.displayAvatarURL())
        .setFooter({ text: 'OweenBot v1.0' });

    await interaction.reply({ embeds: [embed] });
  },
}