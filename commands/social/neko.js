import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";
import { addCoins } from "../../utils/economy.js";

const nekoClient = new NekosLife();

export default {
  data: new SlashCommandBuilder()
    .setName("neko")
    .setDescription("Get a random neko image! 🐱"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await nekoClient.nekoGif();
      const imageUrl = response.url;

      const embed = new EmbedBuilder()
        .setColor('#FF69B4') // Hot pink for nekos?
        .setTitle("Here is your random Neko! 🐾")
        .setImage(imageUrl)
        .setTimestamp()

      const MIN_REWARDS = 1;
      const MAX_REWARDS = 5;
      const reward = Math.floor(Math.random() * (MAX_REWARDS - MIN_REWARDS + 1)) + MIN_REWARDS;

      const newBalance = await addCoins(interaction.user.id, interaction.guildId, reward);

      embed.setFooter({
        text: `¡${interaction.user.username} ganó ${reward} MantiCoins! Saldo: ${newBalance.toLocaleString()} 🪙`,
        iconURL: interaction.client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching neko image:', error);
      await interaction.editReply({
        content: "Sorry, I couldn't find a neko for you right now. 😿",
      });
    }
  },
};
