import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import { getBalance } from '../../utils/economy.js';

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

    // determina el usuario objetivo
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guildId;
    const gifManti = 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp'
    const balance = await getBalance(targetUser.id, guildId);

    const embed = new EmbedBuilder()
      .setColor('#FFD700') // Color Oro
      .setTitle(`💰 Saldo de MantiCoins de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true })) // Avatar del usuario como thumbnail      .setImage(gifManti)
      .setDescription(
        `**MantiCoins:** \`${balance.toLocaleString()}\` 🪙\n\n` +
        `¡Sigue interactuando para ganar más!` // Mensaje adicional de decoración
      )
      .setTimestamp()
      .setFooter({ text: 'MantiCoins - La moneda oficial de OweenBot', iconURL: gifManti })

    await interaction.editReply({ embeds: [embed] });
  }

}