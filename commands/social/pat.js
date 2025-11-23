import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import 'dotenv/config'



export default {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Pat someone! 🫢")
    .addUserOption(option => option.setName("user").setDescription("The user to pat").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos besarnos a uno mismo 
    if (targetUser.id === user.id) {
      await interaction.deferReply({
        ephemeral: true
      })
      return await interaction.editReply({
        content: "You can't pat yourself",
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
    // lista de gifs
    const gifs = [
      'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng0Nml4NXE3MmszZzF6ZG9mcXFmNnY1NHIxeHU1bXI1MjdyZXpqYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ye7OTQgwmVuVy/200.webp',
      'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng0Nml4NXE3MmszZzF6ZG9mcXFmNnY1NHIxeHU1bXI1MjdyZXpqYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5tmRHwTlHAA9WkVxTU/200.webp'
    ]

    try {
      const response = await axios.get(`https://api.giphy.com/v1/gifs/random`, {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          tag: "anime pat",
          rating: "g", // contenido para todo publico
        }
      })
      const ramdomGiff = gifs[Math.floor(Math.random() * gifs.length)]

      const gifUrl = response.data.data?.images?.original?.url || ramdomGiff

      const embed = new EmbedBuilder()
        .setColor('#1E25E9')
        .setDescription(`**${user}** pat **${targetUser}**! 🫢`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      console.log('Error al obtener el gif', error)
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the pat still counts.🫢",
      })
    }



  },
}