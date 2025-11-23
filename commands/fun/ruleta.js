import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../../utils/economy.js';

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

    // Validar fondos
    const currentBalance = await getBalance(userId, guildId);

    if (currentBalance < betAmount) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 ¡No tienes suficientes MantiCoins!')
        .setDescription(
          `**Tu saldo:** ${currentBalance.toLocaleString()} 🪙\n` +
          `**Intentaste apostar:** ${betAmount.toLocaleString()} 🪙\n\n` +
          `Te faltan **${(betAmount - currentBalance).toLocaleString()}** MantiCoins.`
        )
        .setFooter({ text: 'Usa /balance para ver tu saldo actual' });
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Crear botones para elegir color
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`roulette_red_${userId}_${betAmount}`)
          .setLabel('🔴 Rojo (2x)')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`roulette_black_${userId}_${betAmount}`)
          .setLabel('⚫ Negro (2x)')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`roulette_green_${userId}_${betAmount}`)
          .setLabel('🟢 Verde (14x)')
          .setStyle(ButtonStyle.Success)
      );

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎰 Ruleta - Elige tu apuesta')
      .setDescription(
        `**Apuesta:** ${betAmount.toLocaleString()} 🪙\n\n` +
        `**Opciones:**\n` +
        `🔴 **Rojo** - Paga 2x (números: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36)\n` +
        `⚫ **Negro** - Paga 2x (números: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35)\n` +
        `🟢 **Verde (0)** - Paga 14x (número: 0)\n\n` +
        `Elige un color para girar la ruleta!`
      )
      .setFooter({ text: `${interaction.user.username} | Saldo: ${currentBalance.toLocaleString()} 🪙` })
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
          .setTitle('🚫 Error')
          .setDescription('Ya no tienes suficientes MantiCoins para esta apuesta.');
        
        return i.editReply({ embeds: [errorEmbed], components: [] });
      }

      // Animación de ruleta girando
      const spinningEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🎰 La ruleta está girando...')
        .setDescription('🌀 Esperando el resultado...')
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
        colorName = 'Rojo';
        multiplier = 2;
      } else if (resultColor === 'black') {
        colorEmoji = '⚫';
        colorName = 'Negro';
        multiplier = 2;
      } else {
        colorEmoji = '🟢';
        colorName = 'Verde';
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
          `${colorEmoji} **La ruleta cayó en ${colorName} (${result})**\n\n` +
          `✅ **¡GANASTE!**\n` +
          `**Apuesta:** ${betAmount.toLocaleString()} 🪙\n` +
          `**Multiplicador:** ${multiplier}x\n` +
          `**Ganancia:** +${winAmount.toLocaleString()} 🪙\n` +
          `**Nuevo saldo:** ${newBalance.toLocaleString()} 🪙`;
        
        embedColor = '#00FF00';
      } else {
        // Perdió
        newBalance = await removeCoins(userId, guildId, betAmount);
        
        description = 
          `${colorEmoji} **La ruleta cayó en ${colorName} (${result})**\n\n` +
          `❌ **PERDISTE...**\n` +
          `**Apuesta:** ${betAmount.toLocaleString()} 🪙\n` +
          `**Pérdida:** -${betAmount.toLocaleString()} 🪙\n` +
          `**Nuevo saldo:** ${newBalance.toLocaleString()} 🪙`;
        
        embedColor = '#FF0000';
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎰 Resultado de la Ruleta')
        .setDescription(description)
        .setFooter({ text: `${interaction.user.username} | Sistema de Apuestas OweenBot` })
        .setTimestamp();

      await i.editReply({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        // Timeout - nadie presionó los botones
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('⏱️ Tiempo agotado')
          .setDescription('No elegiste ninguna opción. La apuesta ha sido cancelada.');

        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
