import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getBalance, addCoins, removeCoins } from '../../utils/economy.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

// Card deck
const suits = ['♠️', '♥️', '♣️', '♦️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a shuffled deck
function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Calculate hand value
function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

// Format hand for display
function formatHand(hand, hideFirst = false) {
  if (hideFirst) {
    return `🎴 ${hand.slice(1).map(c => `${c.value}${c.suit}`).join(' ')}`;
  }
  return hand.map(c => `${c.value}${c.suit}`).join(' ');
}

// Active games storage
const activeGames = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play Blackjack against the dealer! 🃏')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of MantiCoins to bet')
        .setMinValue(10)
        .setRequired(true)),

  async execute(interaction) {
    const betAmount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const lang = await getGuildLanguage(guildId);

    // Check if user already has an active game
    if (activeGames.has(userId)) {
      return interaction.reply({ 
        content: t(lang, 'blackjack.active_game'), 
        ephemeral: true 
      });
    }

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
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Create deck and deal initial cards
    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    // Store game state
    const gameState = {
      deck,
      playerHand,
      dealerHand,
      betAmount,
      guildId,
      doubled: false,
      lang // Store language in game state
    };
    activeGames.set(userId, gameState);

    // Create buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`bj_hit_${userId}`)
          .setLabel(t(lang, 'blackjack.btn_hit'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`bj_stand_${userId}`)
          .setLabel(t(lang, 'blackjack.btn_stand'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`bj_double_${userId}`)
          .setLabel(t(lang, 'blackjack.btn_double'))
          .setStyle(ButtonStyle.Success)
          .setDisabled(currentBalance < betAmount * 2)
      );

    const embed = new EmbedBuilder()
      .setColor('#1E90FF')
      .setTitle(t(lang, 'blackjack.title'))
      .setDescription(
        `**${t(lang, 'blackjack.your_hand')}:** ${formatHand(playerHand)} (${playerValue})\n` +
        `**${t(lang, 'blackjack.dealer_hand')}:** ${formatHand(dealerHand, true)} (?)\n\n` +
        `**${t(lang, 'economy.bet')}:** ${betAmount.toLocaleString()} 🪙`
      )
      .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDV2ODg2cXR6cmxxYnJjdjhvbmYxdHRqM3EwZG96OWlwMG1lazZ5diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5yYoECDolGySFHKZYl/200.webp')
      .setFooter({ text: `${interaction.user.username} | ${t(lang, 'economy.balance')}: ${currentBalance.toLocaleString()} 🪙` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    // Check for immediate blackjack AFTER replying
    if (playerValue === 21) {
      return await handleBlackjack(interaction, userId, gameState);
    }

    // Create collector for buttons
    const filter = i => i.user.id === userId && i.customId.startsWith('bj_');
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async i => {
      const action = i.customId.split('_')[1];
      const game = activeGames.get(userId);

      if (!game) {
        return i.reply({ content: t(lang, 'blackjack.game_not_found'), ephemeral: true });
      }

      await i.deferUpdate();

      if (action === 'hit') {
        await handleHit(i, userId, game);
      } else if (action === 'stand') {
        await handleStand(i, userId, game);
        collector.stop();
      } else if (action === 'double') {
        await handleDouble(i, userId, game);
        collector.stop();
      }
    });

    collector.on('end', () => {
      if (activeGames.has(userId)) {
        activeGames.delete(userId);
      }
    });
  },
};

async function handleHit(interaction, userId, game) {
  const lang = game.lang;
  game.playerHand.push(game.deck.pop());
  const playerValue = calculateHandValue(game.playerHand);

  if (playerValue > 21) {
    // Bust
    return await endGame(interaction, userId, game, 'bust');
  }

  // Update embed
  const embed = new EmbedBuilder()
    .setColor('#1E90FF')
    .setTitle(t(lang, 'blackjack.title'))
    .setDescription(
      `**${t(lang, 'blackjack.your_hand')}:** ${formatHand(game.playerHand)} (${playerValue})\n` +
      `**${t(lang, 'blackjack.dealer_hand')}:** ${formatHand(game.dealerHand, true)} (?)\n\n` +
      `**${t(lang, 'economy.bet')}:** ${game.betAmount.toLocaleString()} 🪙`
    )
    .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDV2ODg2cXR6cmxxYnJjdjhvbmYxdHRqM3EwZG96OWlwMG1lazZ5diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5yYoECDolGySFHKZYl/200.webp')
    .setFooter({ text: `${interaction.user.username}` })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`bj_hit_${userId}`)
        .setLabel(t(lang, 'blackjack.btn_hit'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`bj_stand_${userId}`)
        .setLabel(t(lang, 'blackjack.btn_stand'))
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleStand(interaction, userId, game) {
  await endGame(interaction, userId, game, 'stand');
}

async function handleDouble(interaction, userId, game) {
  game.betAmount *= 2;
  game.doubled = true;
  game.playerHand.push(game.deck.pop());
  
  await endGame(interaction, userId, game, 'double');
}

async function handleBlackjack(interaction, userId, game) {
  const dealerValue = calculateHandValue(game.dealerHand);
  
  let result;
  if (dealerValue === 21) {
    result = 'push'; // Both have blackjack
  } else {
    result = 'blackjack';
  }
  
  await endGame(interaction, userId, game, result);
}

async function endGame(interaction, userId, game, result) {
  const lang = game.lang;
  // Dealer plays
  let dealerValue = calculateHandValue(game.dealerHand);
  
  if (result !== 'bust') {
    while (dealerValue < 17) {
      game.dealerHand.push(game.deck.pop());
      dealerValue = calculateHandValue(game.dealerHand);
    }
  }

  const playerValue = calculateHandValue(game.playerHand);
  
  // Determine winner
  let winAmount = 0;
  let resultMessage = '';
  let embedColor = '';

  if (result === 'bust' || playerValue > 21) {
    resultMessage = t(lang, 'blackjack.bust', { amount: game.betAmount });
    winAmount = -game.betAmount;
    embedColor = '#FF0000';
  } else if (result === 'blackjack') {
    resultMessage = t(lang, 'blackjack.blackjack_win');
    winAmount = Math.floor(game.betAmount * 1.5); // Blackjack pays 3:2
    embedColor = '#FFD700';
  } else if (dealerValue > 21) {
    resultMessage = t(lang, 'blackjack.dealer_bust', { amount: game.betAmount });
    winAmount = game.betAmount;
    embedColor = '#00FF00';
  } else if (playerValue > dealerValue) {
    resultMessage = t(lang, 'blackjack.win', { amount: game.betAmount });
    winAmount = game.betAmount;
    embedColor = '#00FF00';
  } else if (playerValue < dealerValue) {
    resultMessage = t(lang, 'blackjack.lose', { amount: game.betAmount });
    winAmount = -game.betAmount;
    embedColor = '#FF0000';
  } else {
    resultMessage = t(lang, 'blackjack.push');
    winAmount = 0;
    embedColor = '#FFA500';
  }

  // Update balance
  let newBalance;
  if (winAmount > 0) {
    newBalance = await addCoins(userId, game.guildId, winAmount);
  } else if (winAmount < 0) {
    newBalance = await removeCoins(userId, game.guildId, Math.abs(winAmount));
  } else {
    newBalance = await getBalance(userId, game.guildId);
  }

  // Final embed
  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(t(lang, 'blackjack.result_title'))
    .setDescription(
      `**${t(lang, 'blackjack.your_hand')}:** ${formatHand(game.playerHand)} (${playerValue})\n` +
      `**${t(lang, 'blackjack.dealer_hand')}:** ${formatHand(game.dealerHand)} (${dealerValue})\n\n` +
      resultMessage + '\n\n' +
      `**${t(lang, 'economy.bet')}:** ${game.betAmount.toLocaleString()} 🪙\n` +
      `**${t(lang, 'economy.change')}:** ${winAmount >= 0 ? '+' : ''}${winAmount.toLocaleString()} 🪙\n` +
      `**${t(lang, 'economy.new_balance')}:** ${newBalance.toLocaleString()} 🪙`
    )
    .setFooter({ text: `${interaction.user.username} | OweenBot Betting System` })
    .setTimestamp();

  // Special GIF only when dealer gets exactly 21
  if (dealerValue === 21) {
    embed.setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDJ4ZzZ2M2hoMjNicG5jbnBudjZ6anU3OWxnZDluaGswN3RlbmNxbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufcZICbgCSGe5sQ/giphy.gif');
  }

  await interaction.editReply({ embeds: [embed], components: [] });
  activeGames.delete(userId);
}
