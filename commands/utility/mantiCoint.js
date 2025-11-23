import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import { topUsersManticoins, addCoins, getWorkData, updateWorkTime } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName(`manticoins`)
    .setDescription('MantiCoins system commands')
    .addSubcommand(subcommand =>
      subcommand.setName('top')
        .setDescription('Show the top 10 users with the most MantiCoins'))
    .addSubcommand(subcommand =>
      subcommand.setName('daily')
        .setDescription('Claim your daily MantiCoins'))
    .addSubcommand(subcommand =>
      subcommand.setName('info')
        .setDescription('Show info about MantiCoins')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    // top 10 user with most MantiCoins
    if (subcommand === 'top') {
      await interaction.deferReply();
      const topUsers = await topUsersManticoins();

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
        .setTitle(`💰 Top 10 de MantiCoins`)
        .setDescription(
          leaderBoardString.join('\n')
        )
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }


    // claim daily MantiCoins
    if (subcommand === 'daily') {
      await interaction.deferReply();
      
      // Obtener la última vez que el usuario reclamó el daily
      const { lastDaily } = await getWorkData(interaction.user.id);
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
      const newBalance = await addCoins(interaction.user.id, dailyAmount);
      await updateWorkTime(interaction.user.id);

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
          `**Info de MantiCoins:** \`moneda oficial de OweenBot 🪙\`\n\n` +
          `¡Sigue interactuando para ganar más!` // Mensaje adicional de decoración
        )
        .setTimestamp()
        .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp' })

      await interaction.editReply({ embeds: [embed] });
    }



  }

}