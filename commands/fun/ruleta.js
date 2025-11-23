import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ruleta')
    .setDescription('Juega a la ruleta y apuesta tus MantiCoins! 🎰')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de MantiCoins a apostar')
        .setMinValue(10)
        .setRequired(true)),

  async execute(interaction) {
    const betAmount = interaction.options.getInteger('cantidad');
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const lang = await getGuildLanguage(guildId);

    // Validar fondos
    const currentBalance = await getBalance(userId, guildId);

    if (currentBalance < betAmount) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(t(lang, 'economy.insufficient_funds'))
        .setDescription(
          `**${t(lang, 'economy.balance')}:** ${currentBalance.toLocaleString()} 🪙\n` +
          `**${t(lang, 'economy.bet_amount')}:** ${betAmount.toLocaleString()} 🪙\n\n` +
          t(lang, 'economy.need_more', { amount: (betAmount - currentBalance).toLocaleString() })
        )
        .setFooter({ text: t(lang, 'economy.check_balance') });
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Crear botones para elegir color
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`roulette_red_${userId}_${betAmount}`)
          .setLabel(t(lang, 'ruleta.red_btn'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`roulette_black_${userId}_${betAmount}`)
          .setLabel(t(lang, 'ruleta.black_btn'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`roulette_green_${userId}_${betAmount}`)
          .setLabel(t(lang, 'ruleta.green_btn'))
          .setStyle(ButtonStyle.Success)
      );

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(t(lang, 'ruleta.title'))
      .setDescription(
        `**${t(lang, 'economy.bet')}:** ${betAmount.toLocaleString()} 🪙\n\n` +
        `**${t(lang, 'ruleta.options')}:**\n` +
        `🔴 **${t(lang, 'ruleta.red')}** - ${t(lang, 'ruleta.payout_2x')} (1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36)\n` +
        `⚫ **${t(lang, 'ruleta.black')}** - ${t(lang, 'ruleta.payout_2x')} (2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35)\n` +
        `🟢 **${t(lang, 'ruleta.green')} (0)** - ${t(lang, 'ruleta.payout_14x')} (0)\n\n` +
        t(lang, 'ruleta.choose_color')
      )
      .setFooter({ text: `${interaction.user.username} | ${t(lang, 'economy.balance')}: ${currentBalance.toLocaleString()} 🪙` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    // Crear collector para los botones (60 segundos)
    const filter = i => i.user.id === userId && i.customId.startsWith('roulette_');
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      // Extraer la elección del customId
      const choice = i.customId.split('_')[1]; // 'red', 'black', o 'green'

      // Verificar fondos nuevamente (por si acaso)
      const balanceCheck = await getBalance(userId, guildId);
      if (balanceCheck < betAmount) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(t(lang, 'common.error'))
          .setDescription(t(lang, 'economy.insufficient_funds'));
        
        return i.editReply({ embeds: [errorEmbed], components: [] });
      }

      // Animación de ruleta girando
      const spinningEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(t(lang, 'ruleta.spinning'))
        .setDescription(t(lang, 'ruleta.waiting'))
        .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2swa3MzbWp4bDY3ODZpN3dqaHFwYmU5amwxZHRtenN5cHYwaHl5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2SpYSNrKPONySXYY/giphy.gif');

      await i.editReply({ embeds: [spinningEmbed], components: [] });

      // Esperar 3 segundos para efecto dramático
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Definir números de la ruleta
      const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
      
      // Girar la ruleta (0-36)
      const result = Math.floor(Math.random() * 37);
      
      let resultColor;
      if (result === 0) {
        resultColor = 'green';
      } else if (redNumbers.includes(result)) {
        resultColor = 'red';
      } else {
        resultColor = 'black';
      }

      // Determinar si ganó
      const hasWon = choice === resultColor;
      
      let multiplier;
      let colorEmoji;
      let colorName;

      if (resultColor === 'red') {
        colorEmoji = '🔴';
        colorName = t(lang, 'ruleta.red');
        multiplier = 2;
      } else if (resultColor === 'black') {
        colorEmoji = '⚫';
        colorName = t(lang, 'ruleta.black');
        multiplier = 2;
      } else {
        colorEmoji = '🟢';
        colorName = t(lang, 'ruleta.green');
        multiplier = 14;
      }

      let newBalance;
      let description;
      let embedColor;

      if (hasWon) {
        // Ganó
        const winAmount = betAmount * (multiplier - 1); // Ganancia neta
        newBalance = await addCoins(userId, guildId, winAmount);
        
        description = 
          `${colorEmoji} **${t(lang, 'ruleta.landed_on', { color: colorName, number: result })}**\n\n` +
          `✅ **${t(lang, 'ruleta.win')}**\n` +
          `**${t(lang, 'economy.bet')}:** ${betAmount.toLocaleString()} 🪙\n` +
          `**${t(lang, 'ruleta.multiplier')}:** ${multiplier}x\n` +
          `**${t(lang, 'economy.profit')}:** +${winAmount.toLocaleString()} 🪙\n` +
          `**${t(lang, 'economy.new_balance')}:** ${newBalance.toLocaleString()} 🪙`;
        
        embedColor = '#00FF00';
      } else {
        // Perdió
        newBalance = await removeCoins(userId, guildId, betAmount);
        
        description = 
          `${colorEmoji} **${t(lang, 'ruleta.landed_on', { color: colorName, number: result })}**\n\n` +
          `❌ **${t(lang, 'ruleta.lose')}**\n` +
          `**${t(lang, 'economy.bet')}:** ${betAmount.toLocaleString()} 🪙\n` +
          `**${t(lang, 'economy.loss')}:** -${betAmount.toLocaleString()} 🪙\n` +
          `**${t(lang, 'economy.new_balance')}:** ${newBalance.toLocaleString()} 🪙`;
        
        embedColor = '#FF0000';
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(t(lang, 'ruleta.result_title'))
        .setDescription(description)
        .setFooter({ text: `${interaction.user.username} | OweenBot Betting System` })
        .setTimestamp();

      await i.editReply({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        // Timeout - nadie presionó los botones
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle(t(lang, 'ruleta.timeout_title'))
          .setDescription(t(lang, 'ruleta.timeout_desc'));

        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
