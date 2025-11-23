import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import 'dotenv/config'



export default {
  data: new SlashCommandBuilder()
    .setName("cry")
    .setDescription("Cry because of someone")
    .addUserOption(option => option.setName("user").setDescription("The user that made you cry").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos llorar por uno mismo 
    if (targetUser.id === user.id) {
      await interaction.deferReply({
        ephemeral: true
      })
      return await interaction.editReply({
        content: "You can't cry because of yourself",
      })
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: "🫢 Oh! I'm sorry, but I'm just a bot",
      })
    }
    // DeferReply: Avisamos a Discord que estamos "pensando" (por si Giphy tarda un poco)
    await interaction.deferReply()


    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: "anime cry",
          limit: 50,
          rating: "g"
        }
      })
      const gifs = response.data.data;

      if(!gifs || gifs.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * gifs.length);
      const randomGif = gifs[randomIndex];
      const gifUrl = randomGif.images.original.url;

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setDescription(`**${user}** is crying because of **${targetUser}**! 😢`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      console.log('Error al obtener el gif', error)
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the tears are real.😢",
      })
    }



  },
}
