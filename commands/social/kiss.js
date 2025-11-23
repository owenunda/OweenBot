import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";
import { addCoins } from "../../utils/economy.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

const nekoClient = new NekosLife();

export default {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss someone! 😘")
    .addUserOption(option => option.setName("user").setDescription("The user to kiss").setRequired(true)),

  async execute(interaction) {
    const lang = await getGuildLanguage(interaction.guildId);
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos besarnos a uno mismo 
    if (targetUser.id === user.id) {
      return await interaction.reply({
        content: t(lang, 'kiss.self'),
        ephemeral: true
      });
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: t(lang, 'kiss.bot'),
        ephemeral: true
      });
    }

    // DeferReply: Avisamos a Discord que estamos "pensando"
    await interaction.deferReply();

    try {
      const response = await nekoClient.kiss();
      const imageUrl = response.url;

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setDescription(t(lang, 'kiss.message', { user: user, target: targetUser }))
        .setImage(imageUrl)
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
      console.error('Error fetching kiss image:', error);
      await interaction.editReply({
        content: t(lang, 'common.error'),
      });
    }
  },
};