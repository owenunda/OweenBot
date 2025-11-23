import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine and win MantiCoins! 🎰')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of MantiCoins to bet')
        .setMinValue(10)
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const betAmount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const lang = await getGuildLanguage(guildId);

    // Validate funds
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
      
      return interaction.editReply({ embeds: [errorEmbed] });
    }

    // Slot machine symbols
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
    const weights = [30, 25, 20, 15, 7, 2, 1]; // Probabilities (common to rare)

    // Function to get a weighted random symbol
    const getRandomSymbol = () => {
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < symbols.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return symbols[i];
        }
      }
      return symbols[0];
    };

    // Spinning animation
    const spinningEmbed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(t(lang, 'slots.title'))
      .setDescription(
        '**━━━━━━━━━━━━━━━**\n' +
        `🎰 **${t(lang, 'slots.spinning')}** 🎰\n` +
        '**━━━━━━━━━━━━━━━**\n\n' +
        '> ❓ ❓ ❓\n\n' +
        `🎲 ${t(lang, 'slots.reels_spinning')}`
      )
      .setFooter({ text: `${t(lang, 'economy.bet')}: ${betAmount.toLocaleString()} 🪙` });

    await interaction.editReply({ embeds: [spinningEmbed] });

    // Wait for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate result
    const slot1 = getRandomSymbol();
    const slot2 = getRandomSymbol();
    const slot3 = getRandomSymbol();

    // Calculate multiplier and result
    let multiplier = 0;
    let resultMessage = '';
    let won = false;

    // Jackpot - 3 matching symbols
    if (slot1 === slot2 && slot2 === slot3) {
      won = true;
      // Multipliers based on symbol
      switch (slot1) {
        case '7️⃣':
          multiplier = 100; // 7-7-7 = MEGA JACKPOT!
          resultMessage = t(lang, 'slots.mega_jackpot');
          break;
        case '💎':
          multiplier = 50; // Diamonds
          resultMessage = t(lang, 'slots.diamond_jackpot');
          break;
        case '🔔':
          multiplier = 25; // Bells
          resultMessage = t(lang, 'slots.triple_bells');
          break;
        case '🍇':
          multiplier = 15; // Grapes
          resultMessage = t(lang, 'slots.triple_grapes');
          break;
        case '🍊':
          multiplier = 10; // Oranges
          resultMessage = t(lang, 'slots.triple_oranges');
          break;
        case '🍋':
          multiplier = 7; // Lemons
          resultMessage = t(lang, 'slots.triple_lemons');
          break;
        case '🍒':
          multiplier = 5; // Cherries
          resultMessage = t(lang, 'slots.triple_cherries');
          break;
      }
    }
    // Two matching symbols
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      won = true;
      multiplier = 2; // Pays 2x
      resultMessage = t(lang, 'slots.winning_pair');
    }
    // Lost
    else {
      resultMessage = t(lang, 'slots.no_match');
    }

    // Calculate win/loss
    let newBalance;
    let balanceChange;
    let embedColor;

    if (won) {
      const winAmount = betAmount * (multiplier - 1); // Net profit
      newBalance = await addCoins(userId, guildId, winAmount);
      balanceChange = `+${winAmount.toLocaleString()}`;
      embedColor = multiplier >= 25 ? '#FFD700' : '#00FF00'; // Gold for big jackpots
    } else {
      newBalance = await removeCoins(userId, guildId, betAmount);
      balanceChange = `-${betAmount.toLocaleString()}`;
      embedColor = '#FF0000';
    }

    // Create result embed
    const resultEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(t(lang, 'slots.result_title'))
      .setDescription(
        '**━━━━━━━━━━━━━━━**\n' +
        `🎰 **${t(lang, 'slots.result')}** 🎰\n` +
        '**━━━━━━━━━━━━━━━**\n\n' +
        `> ${slot1} ${slot2} ${slot3}\n\n` +
        resultMessage + '\n\n' +
        `**${t(lang, 'economy.bet')}:** ${betAmount.toLocaleString()} 🪙\n` +
        (won ? `**${t(lang, 'ruleta.multiplier')}:** ${multiplier}x\n` : '') +
        `**${t(lang, 'economy.change')}:** ${balanceChange} 🪙\n` +
        `**${t(lang, 'economy.new_balance')}:** ${newBalance.toLocaleString()} 🪙`
      )
      .setFooter({ text: `${interaction.user.username} | OweenBot Betting System` })
      .setTimestamp();

    // Add celebration image for big jackpots
    if (multiplier >= 25) {
      resultEmbed.setImage('https://tenor.com/view/game-gif-2929360343905304205');
    }
    if (multiplier >= 10 && multiplier < 25) {
      resultEmbed.setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmo3czlneTN0NWQ4eWZ1MTFhMG55bzh4eGFleHF6M3ptMndnd2xiYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26FPLMDDN5fJCir0A/200.webp');
    }
    if (multiplier >= 1 && multiplier < 10) {
      resultEmbed.setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGN2MmNqeGc4Zmtma3puNDJycXJhc2hkMXFvMnE5d2VtM2Y1NzYzMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OH3w9vQaVEwuYmqUlz/giphy.gif');
    }

    await interaction.editReply({ embeds: [resultEmbed] });
  },
};
