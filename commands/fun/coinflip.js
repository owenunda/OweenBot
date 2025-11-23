import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Apuesta MantiCoins lanzando una moneda 🪙')
    .addStringOption(option =>
      option.setName('lado')
        .setDescription('Elige Cara o Cruz')
        .setRequired(true)
        .addChoices(
          { name: 'Cara (Heads)', value: 'cara' },
          { name: 'Cruz (Tails)', value: 'cruz' }
        ))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de MantiCoins a apostar')
        .setMinValue(10) // Apuesta mínima para evitar spam de 1 moneda
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const choice = interaction.options.getString('lado');
    const betAmount = interaction.options.getInteger('cantidad');
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const lang = await getGuildLanguage(guildId);

    // 1. Validación de Fondos
    const currentBalance = await getBalance(userId, guildId);

    if (currentBalance < betAmount) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Rojo
        .setTitle(t(lang, 'economy.insufficient_funds'))
        .setDescription(
          `**${t(lang, 'economy.balance')}:** ${currentBalance.toLocaleString()} 🪙\n` +
          `**${t(lang, 'economy.bet_amount')}:** ${betAmount.toLocaleString()} 🪙\n\n` +
          t(lang, 'economy.need_more', { amount: (betAmount - currentBalance).toLocaleString() })
        )
        .setFooter({ text: t(lang, 'economy.check_balance') });
      
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    // Mostrar animación de moneda girando
    const coinflipGif = 'https://media.tenor.com/Vl6iJkR2IzMAAAAm/memecoin.webp';
    const loadingEmbed = new EmbedBuilder()
      .setDescription(t(lang, 'coinflip.flipping'))
      .setImage(coinflipGif) // Gif de moneda
      .setColor('Yellow');

    await interaction.editReply({ embeds: [loadingEmbed] });

    // Esperar un poco para efecto dramático
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Lógica del Juego (50% de probabilidad)
    // Math.random() < 0.5 será 'cara', de lo contrario 'cruz'
    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const hasWon = choice === result;

    // Imágenes para el Embed (puedes cambiarlas)
    const coinImg = result === 'cara'
      ? 'https://media.tenor.com/JBYCgGO1vtcAAAAi/publi-art.gif' // Imagen de Cara
      : 'https://media.tenor.com/EXRUmfDcs8oAAAAi/crypto-coin-crypto.gif'; // Imagen de Cruz

    // 3. Transacción en Base de Datos
    let newBalance;
    let description;
    let color;

    if (hasWon) {
      // Ganó: Se le suma la cantidad apostada (Profit)
      newBalance = await addCoins(userId, guildId, betAmount);
      description = t(lang, 'coinflip.win', { result: result.toUpperCase(), amount: betAmount.toLocaleString() });
      color = '#00FF00'; // Verde
    } else {
      // Perdió: Se le resta lo apostado
      newBalance = await removeCoins(userId, guildId, betAmount);
      description = t(lang, 'coinflip.lose', { result: result.toUpperCase(), amount: betAmount.toLocaleString() });
      color = '#FF0000'; // Rojo
    }

    // 4. Crear Embed de Resultado
    const embed = new EmbedBuilder()
      .setTitle(t(lang, 'coinflip.title', { user: interaction.user.username, amount: betAmount }))
      .setDescription(description)
      .addFields({ name: t(lang, 'economy.new_balance'), value: `${newBalance.toLocaleString()} 🪙` })
      .setThumbnail(coinImg) // Muestra la moneda resultante
      .setColor(color)
      .setFooter({ text: 'Sistema de Apuestas OweenBot', iconURL: coinflipGif });

    await interaction.editReply({ embeds: [embed] });
  },
};