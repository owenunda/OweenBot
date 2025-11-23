import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import 'dotenv/config'
import { addCoins } from "../../utils/economy.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

export default {
  data: new SlashCommandBuilder()
    .setName("punch")
    .setDescription("Punch someone! 👊")
    .addUserOption(option => option.setName("user").setDescription("The user to punch").setRequired(true)),

  async execute(interaction) {
    const lang = await getGuildLanguage(interaction.guildId);
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos golpearnos a uno mismo 
    if (targetUser.id === user.id) {
      return await interaction.reply({
        content: t(lang, 'punch.self_punch'),
        ephemeral: true
      });
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: t(lang, 'punch.bot_punch'),
        ephemeral: true
      });
    }

    // DeferReply: Avisamos a Discord que estamos "pensando" (por si Giphy tarda un poco)
    await interaction.deferReply();

    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: "anime punch",
          limit: 50,
          rating: "g"
        }
      });
      const gifs = response.data.data;

      if(!gifs || gifs.length === 0) {
        return await interaction.editReply({
          content: t(lang, 'common.no_gifs')
        });
      }

      const randomIndex = Math.floor(Math.random() * gifs.length);
      const randomGif = gifs[randomIndex];
      const gifUrl = randomGif.images.original.url;

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setDescription(t(lang, 'punch.message', { user: user, target: targetUser }))
        .setImage(gifUrl)
        .setTimestamp()

      const MIN_REWARDS = 1;
      const MAX_REWARDS = 5;
      const reward = Math.floor(Math.random() * (MAX_REWARDS - MIN_REWARDS + 1)) + MIN_REWARDS;

      const newBalance = await addCoins(user.id, interaction.guildId, reward);

      embed.setFooter({
        text: t(lang, 'economy.reward', { user: user.username, reward: reward, balance: newBalance.toLocaleString() }),
        iconURL: interaction.client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching punch gif:', error);
      await interaction.editReply({
        content: t(lang, 'common.error'),
      });
    }
  },
};
