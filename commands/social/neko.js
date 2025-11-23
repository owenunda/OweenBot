import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";

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
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching neko image:', error);
      await interaction.editReply({
        content: "Sorry, I couldn't find a neko for you right now. 😿",
      });
    }
  },
};
