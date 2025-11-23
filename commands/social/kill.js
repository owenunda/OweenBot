import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import 'dotenv/config'



export default {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Kill someone (game)")
    .addUserOption(option => option.setName("user").setDescription("The user to kill (game)").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos matarnos a uno mismo 
    if (targetUser.id === user.id) {
      await interaction.deferReply({
        ephemeral: true
      })
      return await interaction.editReply({
        content: "You can't kill yourself",
      })
    }

    // Si menciona al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: "🫢 Oh! You can't kill me, I'm immortal!",
      })
    }
    // DeferReply: Avisamos a Discord que estamos "pensando" (por si Giphy tarda un poco)
    await interaction.deferReply()

    // Lista de búsquedas alternativas para variedad
    const searchTerms = ["anime kill", "wasted gta"];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: randomTerm,
          limit: 50,
          rating: "pg-13"
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
        .setColor('#8B0000')
        .setDescription(`**${user}** killed **${targetUser}**! 💀 (It's just a game!)`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      console.log('Error al obtener el gif', error)
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the kill still counts.💀",
      })
    }



  },
}
