import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import 'dotenv/config'
import { addCoins } from "../../utils/economy.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dance")
    .setDescription("Dance with someone! 💃")
    .addUserOption(option => option.setName("user").setDescription("The user to dance with").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos bailar con uno mismo 
    if (targetUser.id === user.id) {
      return await interaction.reply({
        content: "You can't dance with yourself! 🥺",
        ephemeral: true
      });
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: "🫢 Oh! Thank you, but I'm a bot! 🤖",
        ephemeral: true
      });
    }

    // DeferReply: Avisamos a Discord que estamos "pensando" (por si Giphy tarda un poco)
    await interaction.deferReply();

    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: "anime dance",
          limit: 50,
          rating: "g"
        }
      });
      const gifs = response.data.data;

      if(!gifs || gifs.length === 0) {
        return await interaction.editReply({
          content: "No GIFs found, but the dance still counts. 💃"
        });
      }

      const randomIndex = Math.floor(Math.random() * gifs.length);
      const randomGif = gifs[randomIndex];
      const gifUrl = randomGif.images.original.url;

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setDescription(`**${user}** is dancing with **${targetUser}**! 💃`)
        .setImage(gifUrl)
        .setTimestamp()

      const MIN_REWARDS = 1;
      const MAX_REWARDS = 5;
      const reward = Math.floor(Math.random() * (MAX_REWARDS - MIN_REWARDS + 1)) + MIN_REWARDS;

      const newBalance = await addCoins(user.id, reward);

      embed.setFooter({
        text: `¡${user.username} ganó ${reward} MantiCoins! Saldo: ${newBalance.toLocaleString()} 🪙`,
        iconURL: interaction.client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching dance gif:', error);
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the dance still counts. 💃",
      });
    }
  },
};
