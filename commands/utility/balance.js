import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Show your current MantiCoins balance or another users')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose balance you want to check (optional)')
        .setRequired(false)),

  async execute(interaction) {
    // para operaciones de DB
    await interaction.deferReply();

    const lang = await getGuildLanguage(interaction.guildId);

    // determina el usuario objetivo
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guildId;
    const gifManti = 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp'
    const balance = await getBalance(targetUser.id, guildId);

    const embed = new EmbedBuilder()
      .setColor('#FFD700') // Color Oro
      .setTitle(t(lang, 'balance.title', { user: targetUser.username }))
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true })) // Avatar del usuario como thumbnail      .setImage(gifManti)
      .setDescription(
        `**${t(lang, 'balance.field')}:** \`${balance.toLocaleString()}\` 🪙`
      )
      .setTimestamp()
      .setFooter({ text: t(lang, 'balance.footer'), iconURL: gifManti })

    await interaction.editReply({ embeds: [embed] });
  }

}