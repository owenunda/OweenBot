import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import { topUsersManticoins, topUsersManticoinsByGuild, addCoins, getWorkData, updateWorkTime } from '../../utils/economy.js';

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

    // Top 10 del SERVIDOR ACTUAL
    if (subcommand === 'top') {
      await interaction.deferReply();
      const guildId = interaction.guildId;
      const topUsers = await topUsersManticoinsByGuild(guildId);

      if (topUsers.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(`💰 Top de MantiCoins - ${interaction.guild.name}`)
          .setDescription('¡Aún no hay usuarios en el ranking de este servidor!\n\nSé el primero en ganar MantiCoins.')
          .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' });
        
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
            return `**${index + 1}.** Usuario Desconocido (${user.userid}) - ${user.manticoins.toLocaleString()} 🪙`;
          }
        })
      )

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(`💰 Top 10 de MantiCoins - ${interaction.guild.name}`)
        .setDescription(leaderBoardString.join('\n'))
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }

    // Top 10 GLOBAL (todos los servidores)
    if (subcommand === 'global') {
      await interaction.deferReply();
      const topUsers = await topUsersManticoins();

      if (topUsers.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(`💰 Top de MantiCoins Global`)
          .setDescription('¡Aún no hay usuarios en el ranking global!\n\nSé el primero en ganar MantiCoins.')
          .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' });
        
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
            return `**${index + 1}.** Usuario Desconocido (${user.userid}) - ${user.manticoins.toLocaleString()} 🪙`;
          }
        })
      )

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(`💰 Top de MantiCoins Global`)
        .setDescription(leaderBoardString.join('\n'))
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

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

      // Verificar si han pasado 24 horas
      if (hoursDiff < 24) {
        const hoursLeft = Math.floor(24 - hoursDiff);
        const minutesLeft = Math.floor((24 - hoursDiff - hoursLeft) * 60);

        const embed = new EmbedBuilder()
          .setColor('#FF6B6B') // Color rojo para indicar error
          .setTitle(`⏰ Daily MantiCoins`)
          .setDescription(
            `Ya reclamaste tu recompensa diaria.\n\n` +
            `**Tiempo restante:** ${hoursLeft}h ${minutesLeft}m`
          )
          .setTimestamp()
          .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

        return await interaction.editReply({ embeds: [embed] });
      }

      // Si han pasado 24 horas, dar las monedas
      const dailyAmount = 100; // Cantidad de monedas diarias
      const newBalance = await addCoins(userId, guildId, dailyAmount);
      await updateWorkTime(userId, guildId);

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(`💰 Daily MantiCoins`)
        .setDescription(
          `¡Has reclamado tu recompensa diaria!\n\n` +
          `**+${dailyAmount} MantiCoins** 🪙\n` +
          `**Nuevo saldo:** \`${newBalance.toLocaleString()}\` 🪙`
        )
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }

    // info about MantiCoins
    if (subcommand === 'info') {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(`💰 Info de MantiCoins`)
        .setDescription(
          `**MantiCoins** es la moneda oficial de OweenBot 🪙\n\n` +
          `**¿Cómo ganar MantiCoins?**\n` +
          `• Usa comandos sociales (beso, abrazo, etc.)\n` +
          `• Reclama tu recompensa diaria con \`/manticoins daily\`\n` +
          `• Juega y apuesta con \`/coinflip\`\n\n` +
          `**Comandos disponibles:**\n` +
          `• \`/balance\` - Ver tu saldo\n` +
          `• \`/manticoins top\` - Top del servidor\n` +
          `• \`/manticoins global\` - Top global\n` +
          `• \`/manticoins daily\` - Recompensa diaria\n\n` +
          `**Nota:** Cada servidor tiene su propia economía independiente.`
        )
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }



  }

}