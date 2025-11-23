import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import { topUsersManticoins, addCoins } from '../../utils/economy.js';

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
      const daily = await addCoins(interaction.user.id, 10);

      const embed = new EmbedBuilder()
        .setColor('#FFD700') // Color Oro
        .setTitle(`💰 Daily MantiCoins`)
        .setDescription(
          `**Daily MantiCoins:** \`${daily.toLocaleString()} 🪙\`\n\n` +
          `¡Sigue interactuando para ganar más!` // Mensaje adicional de decoración
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