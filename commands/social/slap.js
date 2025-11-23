import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import 'dotenv/config'



export default {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Slap someone! 🫢")
    .addUserOption(option => option.setName("user").setDescription("The user to slap").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos besarnos a uno mismo 
    if (targetUser.id === user.id) {
      await interaction.deferReply({
        ephemeral: true
      })
      return await interaction.editReply({
        content: "You can't slap yourself",
      })
    }

    // Si mencioa al mismo bot
    if (targetUser.id === interaction.client.user.id) {
      return await interaction.reply({
        content: "🫢 Oh! Thanks you, but I'm a bot",
      })
    }
    // DeferReply: Avisamos a Discord que estamos "pensando" (por si Giphy tarda un poco)
    await interaction.deferReply()


    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          // 2. FILTRO MÁS AGRESIVO
          q: "manga style slap reaction", // Usa esta frase
          limit: 50, // Traemos 50 resultados
          rating: "g"
        }
      })
      const gifs = response.data.data; // Aquí 'gifs' AHORA SÍ es la lista de 50 resultados

      if(!gifs || gifs.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * gifs.length);
      const randomGif = gifs[randomIndex];
      const gifUrl = randomGif.images.original.url;

      const embed = new EmbedBuilder()
        .setColor('#1E25E9')
        .setDescription(`**${user}** slapped **${targetUser}**! 🫢`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      console.log('Error al obtener el gif', error)
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the slap still counts.🫢",
      })
    }



  },
}