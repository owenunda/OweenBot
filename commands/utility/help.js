import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and information about the bot'),

  async execute(interaction) {
    // Create category select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Select a Category')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('🎮 Fun Commands')
          .setDescription('Entertainment and game commands')
          .setValue('fun'),
        new StringSelectMenuOptionBuilder()
          .setLabel('💰 Economy Commands')
          .setDescription('MantiCoins and betting commands')
          .setValue('economy'),
        new StringSelectMenuOptionBuilder()
          .setLabel('❤️ Social Commands')
          .setDescription('Interact with other users')
          .setValue('social'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🛠️ Utility Commands')
          .setDescription('Useful utility commands')
          .setValue('utility'),
        new StringSelectMenuOptionBuilder()
          .setLabel('ℹ️ Bot Information')
          .setDescription('About OweenBot')
          .setValue('info')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Main help embed
    const mainEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 OweenBot - Help Menu')
      .setDescription(
        '**Welcome to OweenBot!**\n\n' +
        'Select a category below to see available commands.\n\n' +
        '**Categories:**\n' +
        '🎮 **Fun** - Games and entertainment\n' +
        '💰 **Economy** - MantiCoins system\n' +
        '❤️ **Social** - Interact with others\n' +
        '🛠️ **Utility** - Useful tools\n' +
        'ℹ️ **Info** - About the bot'
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'Use the dropdown menu to navigate' })
      .setTimestamp();

    await interaction.reply({ embeds: [mainEmbed], components: [row] });

    // Create collector for the select menu
    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutes

    collector.on('collect', async i => {
      if (i.customId === 'help_category') {
        // Try to defer update, but catch if already acknowledged
        try {
          await i.deferUpdate();
        } catch (error) {
          // Interaction already acknowledged, continue anyway
        }
        
        const category = i.values[0];
        let embed;

        switch (category) {
          case 'fun':
            embed = new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('🎮 Fun Commands')
              .setDescription('Entertainment and game commands')
              .addFields(
                { name: '/blackjack <amount>', value: 'Play Blackjack against the dealer! Try to get 21 without going over.', inline: false },
                { name: '/coinflip <side> <amount>', value: 'Flip a coin and bet on Heads or Tails. Win 2x your bet!', inline: false },
                { name: '/ruleta <amount>', value: 'Spin the roulette wheel! Bet on Red (2x), Black (2x), or Green (14x).', inline: false },
                { name: '/slots <amount>', value: 'Play the slot machine! Match 3 symbols for big wins. Jackpot: 100x!', inline: false },
                { name: '/neko', value: 'Get a random cute neko image and earn MantiCoins!', inline: false },
                { name: '/random-agent <role>', value: 'Get a random Valorant agent by role (Sentinel, Duelist, Initiator, Controller).', inline: false },
                { name: '/ping', value: 'Check the bot\'s response time and latency.', inline: false }
              )
              .setFooter({ text: 'All casino games use MantiCoins' })
              .setTimestamp();
            break;

          case 'economy':
            embed = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle('💰 Economy Commands')
              .setDescription('MantiCoins system - The official currency of OweenBot')
              .addFields(
                { name: '/balance [user]', value: 'Check your MantiCoins balance or another user\'s balance.', inline: false },
                { name: '/manticoins top', value: 'View the top 10 richest users in this server.', inline: false },
                { name: '/manticoins global', value: 'View the top 10 richest users globally across all servers.', inline: false },
                { name: '/manticoins daily', value: 'Claim your daily reward of 100 MantiCoins! (24h cooldown)', inline: false },
                { name: '/manticoins info', value: 'Learn about the MantiCoins system and how to earn more.', inline: false }
              )
              .setFooter({ text: 'Each server has its own economy!' })
              .setTimestamp();
            break;

          case 'social':
            embed = new EmbedBuilder()
              .setColor('#FF69B4')
              .setTitle('❤️ Social Commands')
              .setDescription('Interact with other users and earn MantiCoins!')
              .addFields(
                { name: '/kiss <user>', value: 'Give someone a kiss! 😘 Earn 1-5 MantiCoins.', inline: true },
                { name: '/hug <user>', value: 'Give someone a warm hug! 🤗 Earn 1-5 MantiCoins.', inline: true },
                { name: '/slap <user>', value: 'Slap someone! 👋 Earn 1-5 MantiCoins.', inline: true },
                { name: '/pat <user>', value: 'Pat someone on the head! 🤚 Earn 1-5 MantiCoins.', inline: true },
                { name: '/cry', value: 'Express your sadness. 😢 Earn 1-5 MantiCoins.', inline: true },
                { name: '/dance', value: 'Show off your dance moves! 💃 Earn 1-5 MantiCoins.', inline: true },
                { name: '/punch <user>', value: 'Punch someone! 👊 Earn 1-5 MantiCoins.', inline: true },
                { name: '/kill <user>', value: 'Eliminate someone (virtually)! 💀 Earn 1-5 MantiCoins.', inline: true }
              )
              .setFooter({ text: 'All social commands reward MantiCoins!' })
              .setTimestamp();
            break;

          case 'utility':
            embed = new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle('🛠️ Utility Commands')
              .setDescription('Useful tools and utilities')
              .addFields(
                { name: '/help', value: 'Show this help menu with all available commands.', inline: false },
                { name: '/infobot', value: 'Display detailed information about OweenBot.', inline: false },
                { name: '/avatar [user]', value: 'Get the avatar of yourself or another user.', inline: false },
                { name: '/server', value: 'Display information about the current server.', inline: false },
                { name: '/user', value: 'Show information about yourself.', inline: false },
                { name: '/joindate [user]', value: 'Shows when a user joined the server with detailed time calculations.', inline: false }
              )
              .setFooter({ text: 'More utility commands coming soon!' })
              .setTimestamp();
            break;

          case 'info':
            embed = new EmbedBuilder()
              .setColor('#00D9FF')
              .setTitle('ℹ️ About OweenBot')
              .setDescription(
                '**OweenBot** is a multipurpose Discord bot with games, economy, and social features!\n\n' +
                '**Features:**\n' +
                '🎰 **Casino Games** - Blackjack, Roulette, Slots, Coinflip\n' +
                '💰 **Economy System** - Earn and spend MantiCoins\n' +
                '❤️ **Social Interactions** - Fun commands to interact with friends\n' +
                '🏆 **Leaderboards** - Compete with others globally or per server\n' +
                '🎮 **Valorant** - Random agent selector\n\n' +
                '**MantiCoins System:**\n' +
                '• Each server has its own independent economy\n' +
                '• Earn coins through social commands and daily rewards\n' +
                '• Use coins to play casino games and win big!\n' +
                '• Global and server-specific leaderboards\n\n' +
                '**Support:**\n' +
                'Need help? Use `/help` to see all commands!\n' +
                'Join our support server: [Discord](https://discord.gg/3rE9PRH95y)'
              )
              .addFields(
                { name: '📊 Statistics', value: `Servers: ${interaction.client.guilds.cache.size}\nUsers: ${interaction.client.users.cache.size}`, inline: true },
                { name: '🔗 Links', value: '[GitHub](https://github.com/owenunda/OweenBot/)\n[Website](https://oweenbot.oween.software/)', inline: true },
                { name: '👨‍💻 Developer', value: 'oweenunda#9782\nusername: manticora', inline: true }
              )
              .setThumbnail(interaction.client.user.displayAvatarURL())
              .setFooter({ text: `OweenBot v1.0 | Made with ❤️` })
              .setTimestamp();
            break;
        }

        await i.editReply({ embeds: [embed], components: [row] });
      }
    });

    collector.on('end', () => {
      // Disable the select menu after timeout
      selectMenu.setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(selectMenu);
      interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  },
};
