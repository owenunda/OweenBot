import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import { topUsersManticoins, topUsersManticoinsByGuild, addCoins, getWorkData, updateWorkTime } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName(`manticoins`)
    .setDescription('MantiCoins system commands')
    .addSubcommand(subcommand =>
      subcommand.setName('top')
        .setDescription('Show the top 10 users with the most MantiCoins in this server'))
    .addSubcommand(subcommand =>
      subcommand.setName('global')
        .setDescription('Show the top 10 users with the most MantiCoins globally'))
    .addSubcommand(subcommand =>
      subcommand.setName('daily')
        .setDescription('Claim your daily MantiCoins'))
    .addSubcommand(subcommand =>
      subcommand.setName('info')
        .setDescription('Show info about MantiCoins')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const lang = await getGuildLanguage(interaction.guildId);

    // Top 10 del SERVIDOR ACTUAL
    if (subcommand === 'top') {
      await interaction.deferReply();
      const guildId = interaction.guildId;
      const topUsers = await topUsersManticoinsByGuild(guildId);

      if (topUsers.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(t(lang, 'manticoint.top_title', { guildName: interaction.guild.name }))
          .setDescription(t(lang, 'manticoint.empty'))
          .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' });
        
        return await interaction.editReply({ embeds: [emptyEmbed] });
      }

      const leaderBoardString = await Promise.all(
        topUsers.map(async (user, index) => {
          try {
            // Buscamos el usuario en la caché o API de Discord
            const discordUser = await interaction.client.users.fetch(user.userid);
            // Retornamos la línea formateada con el nombre real
            return `**${index + 1}.** ${discordUser.username} - ${user.manticoins.toLocaleString()} 🪙`;
          } catch (error) {
            // Si el usuario borró su cuenta o no se encuentra
            return `**${index + 1}.** ${t(lang, 'manticoint.unknown_user')} (${user.userid}) - ${user.manticoins.toLocaleString()} 🪙`;
          }
        })
      )

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(t(lang, 'manticoint.top_title', { guildName: interaction.guild.name }))
        .setDescription(leaderBoardString.join('\n'))
        .setTimestamp()
        .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }

    // Top 10 GLOBAL (todos los servidores)
    if (subcommand === 'global') {
      await interaction.deferReply();
      const topUsers = await topUsersManticoins();

      if (topUsers.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(t(lang, 'manticoint.global_title'))
          .setDescription(t(lang, 'manticoint.empty'))
          .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' });
        
        return await interaction.editReply({ embeds: [emptyEmbed] });
      }

      const leaderBoardString = await Promise.all(
        topUsers.map(async (user, index) => {
          try {
            // Buscamos el usuario en la caché o API de Discord
            const discordUser = await interaction.client.users.fetch(user.userid);
            // Retornamos la línea formateada con el nombre real
            return `**${index + 1}.** ${discordUser.username} - ${user.manticoins.toLocaleString()} 🪙`;
          } catch (error) {
            // Si el usuario borró su cuenta o no se encuentra
            return `**${index + 1}.** ${t(lang, 'manticoint.unknown_user')} (${user.userid}) - ${user.manticoins.toLocaleString()} 🪙`;
          }
        })
      )

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(t(lang, 'manticoint.global_title'))
        .setDescription(leaderBoardString.join('\n'))
        .setTimestamp()
        .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }


    // claim daily MantiCoins
    if (subcommand === 'daily') {
      await interaction.deferReply();

      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      // Obtener la última vez que el usuario reclamó el daily
      const { lastDaily } = await getWorkData(userId, guildId);
      const now = new Date();
      const timeDiff = now - new Date(lastDaily);
      const hoursDiff = timeDiff / (1000 * 60 * 60); // Convertir a horas
      // Si han pasado 24 horas, dar las monedas
      const dailyAmount = 100; // Cantidad de monedas diarias
      const newBalance = await addCoins(userId, guildId, dailyAmount);
      await updateWorkTime(userId, guildId);

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(t(lang, 'manticoint.daily_title'))
        .setDescription(t(lang, 'manticoint.daily_success', { amount: dailyAmount, balance: newBalance.toLocaleString() }))
        .setTimestamp()
        .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }

    // info about MantiCoins
    if (subcommand === 'info') {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(t(lang, 'manticoint.info_title'))
        .setDescription(
          `${t(lang, 'manticoint.info_desc')}\n\n` +
          `${t(lang, 'manticoint.info_earn')}\n\n` +
          `${t(lang, 'manticoint.info_commands')}\n\n` +
          `${t(lang, 'manticoint.info_note')}`
        )
        .setTimestamp()
        .setFooter({ text: 'MantiCoins', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }
  }

}