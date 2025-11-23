import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and information about the bot'),

  async execute(interaction) {
    const lang = await getGuildLanguage(interaction.guildId);

    // Create category select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder(t(lang, 'help.select_category'))
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(t(lang, 'help.categories.fun'))
          .setDescription(t(lang, 'help.categories.fun_desc'))
          .setValue('fun'),
        new StringSelectMenuOptionBuilder()
          .setLabel(t(lang, 'help.categories.economy'))
          .setDescription(t(lang, 'help.categories.economy_desc'))
          .setValue('economy'),
        new StringSelectMenuOptionBuilder()
          .setLabel(t(lang, 'help.categories.social'))
          .setDescription(t(lang, 'help.categories.social_desc'))
          .setValue('social'),
        new StringSelectMenuOptionBuilder()
          .setLabel(t(lang, 'help.categories.utility'))
          .setDescription(t(lang, 'help.categories.utility_desc'))
          .setValue('utility'),
        new StringSelectMenuOptionBuilder()
          .setLabel(t(lang, 'help.categories.info'))
          .setDescription(t(lang, 'help.categories.info_desc'))
          .setValue('info')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Main help embed
    const mainEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(t(lang, 'help.embed.title'))
      .setDescription(t(lang, 'help.embed.welcome'))
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: t(lang, 'help.embed.footer') })
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

        // Re-fetch language in case it changed (optional, but good practice)
        // For now we use the same lang as the command execution for consistency within the session

        switch (category) {
          case 'fun':
            embed = new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle(t(lang, 'help.fun_embed.title'))
              .setDescription(t(lang, 'help.fun_embed.desc'))
              .addFields(
                { name: '/blackjack <amount>', value: t(lang, 'blackjack.description'), inline: false },
                { name: '/coinflip <side> <amount>', value: t(lang, 'coinflip.description'), inline: false },
                { name: '/ruleta <amount>', value: t(lang, 'ruleta.description'), inline: false },
                { name: '/slots <amount>', value: t(lang, 'slots.description'), inline: false },
                { name: '/neko', value: t(lang, 'neko.description'), inline: false },
                { name: '/valorant-random <role>', value: t(lang, 'valorant.description'), inline: false },
                { name: '/ping', value: t(lang, 'ping.description'), inline: false }
              )
              .setFooter({ text: t(lang, 'help.fun_embed.footer') })
              .setTimestamp();
            break;

          case 'economy':
            embed = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle(t(lang, 'help.economy_embed.title'))
              .setDescription(t(lang, 'help.economy_embed.desc'))
              .addFields(
                { name: '/balance [user]', value: t(lang, 'balance.description'), inline: false },
                { name: '/manticoins top', value: t(lang, 'manticoint.top_title'), inline: false },
                { name: '/manticoins global', value: t(lang, 'manticoint.global_title'), inline: false },
                { name: '/manticoins daily', value: t(lang, 'manticoint.info_earn'), inline: false },
                { name: '/manticoins info', value: t(lang, 'manticoint.info_desc'), inline: false }
              )
              .setFooter({ text: t(lang, 'help.economy_embed.footer') })
              .setTimestamp();
            break;

          case 'social':
            embed = new EmbedBuilder()
              .setColor('#FF69B4')
              .setTitle(t(lang, 'help.social_embed.title'))
              .setDescription(t(lang, 'help.social_embed.desc'))
              .addFields(
                { name: '/kiss <user>', value: t(lang, 'kiss.description'), inline: true },
                { name: '/hug <user>', value: t(lang, 'hug.description') || 'Hug someone!', inline: true }, // Fallback if missing
                { name: '/slap <user>', value: t(lang, 'slap.description'), inline: true },
                { name: '/pat <user>', value: t(lang, 'pat.description'), inline: true },
                { name: '/cry', value: t(lang, 'cry.description'), inline: true },
                { name: '/dance', value: t(lang, 'dance.description'), inline: true },
                { name: '/punch <user>', value: t(lang, 'punch.description'), inline: true },
                { name: '/kill <user>', value: t(lang, 'kill.description'), inline: true }
              )
              .setFooter({ text: t(lang, 'help.social_embed.footer') })
              .setTimestamp();
            break;

          case 'utility':
            embed = new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle(t(lang, 'help.utility_embed.title'))
              .setDescription(t(lang, 'help.utility_embed.desc'))
              .addFields(
                { name: '/help', value: t(lang, 'help.description'), inline: false },
                { name: '/language set <lang>', value: t(lang, 'language.description'), inline: false },
                { name: '/infobot', value: t(lang, 'infobot.description'), inline: false },
                { name: '/avatar [user]', value: t(lang, 'avatar.description'), inline: false },
                { name: '/server', value: t(lang, 'server.info', { name: '', members: '' }).split('\n')[0], inline: false }, // Hacky way to get description
                { name: '/user', value: t(lang, 'user.description'), inline: false },
                { name: '/joindate [user]', value: t(lang, 'joindate.description'), inline: false }
              )
              .setFooter({ text: t(lang, 'help.utility_embed.footer') })
              .setTimestamp();
            break;

          case 'info':
            embed = new EmbedBuilder()
              .setColor('#00D9FF')
              .setTitle(t(lang, 'help.info_embed.title'))
              .setDescription(t(lang, 'help.info_embed.desc'))
              .addFields(
                { name: t(lang, 'help.info_embed.stats'), value: t(lang, 'help.info_embed.stats_value', { servers: interaction.client.guilds.cache.size, users: interaction.client.users.cache.size }), inline: true },
                { name: t(lang, 'help.info_embed.links'), value: '[GitHub](https://github.com/owenunda/OweenBot/)\n[Website](https://oweenbot.oween.software/)', inline: true },
                { name: t(lang, 'help.info_embed.dev'), value: 'oweenunda#9782\nusername: manticora', inline: true }
              )
              .setThumbnail(interaction.client.user.displayAvatarURL())
              .setFooter({ text: t(lang, 'help.info_embed.footer') })
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
