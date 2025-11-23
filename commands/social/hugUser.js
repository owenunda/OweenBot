import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";
import { addCoins } from "../../utils/economy.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

const nekoClient = new NekosLife();

export default {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone! 🫢")
    .addUserOption(option => option.setName("user").setDescription("The user to hug").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;
    const guildId = interaction.guildId;
    const lang = await getGuildLanguage(guildId);

    // Evitamos abrazarnos a uno mismo 
    if (targetUser.id === user.id) {
      return await interaction.reply({
        content: t(lang, 'hug.self_hug'),
        ephemeral: true
      });
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: t(lang, 'hug.bot_hug'),
        ephemeral: true
      });
    }

    // DeferReply: Avisamos a Discord que estamos "pensando"
    await interaction.deferReply();

    try {
      const response = await nekoClient.hug();
      const imageUrl = response.url;

      const embed = new EmbedBuilder()
        .setColor('#1EE9E9')
        .setDescription(t(lang, 'hug.hug_message', { user: user, target: targetUser }))
        .setImage(imageUrl)
        .setTimestamp()

      const MIN_REWARDS = 1;
      const MAX_REWARDS = 5;
      const reward = Math.floor(Math.random() * (MAX_REWARDS - MIN_REWARDS + 1)) + MIN_REWARDS;

      const newBalance = await addCoins(user.id, interaction.guildId, reward);

      embed.setFooter({
        text: t(lang, 'hug.reward', { user: user.username, reward: reward, balance: newBalance.toLocaleString() }),
        iconURL: interaction.client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching hug image:', error);
      
      await interaction.editReply({
        content: t(lang, 'hug.error_gif'),
      });
    }
  },
};