import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";
import { addCoins } from "../../utils/economy.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

const nekoClient = new NekosLife();

export default {
  data: new SlashCommandBuilder()
    .setName("neko")
    .setDescription("Get a random neko image! 🐱"),

  async execute(interaction) {
    await interaction.deferReply();
    const lang = await getGuildLanguage(interaction.guildId);

    try {
      const response = await nekoClient.nekoGif();
      const imageUrl = response.url;

      const embed = new EmbedBuilder()
        .setColor('#FF69B4') // Hot pink for nekos?
        .setTitle(t(lang, 'neko.title'))
        .setImage(imageUrl)
        .setTimestamp()

      const MIN_REWARDS = 1;
      const MAX_REWARDS = 5;
      const reward = Math.floor(Math.random() * (MAX_REWARDS - MIN_REWARDS + 1)) + MIN_REWARDS;

      const newBalance = await addCoins(interaction.user.id, interaction.guildId, reward);

      embed.setFooter({
        text: t(lang, 'economy.reward', { user: interaction.user.username, reward: reward, balance: newBalance.toLocaleString() }),
        iconURL: interaction.client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching neko image:', error);
      await interaction.editReply({
        content: t(lang, 'common.error'),
      });
    }
  },
};
