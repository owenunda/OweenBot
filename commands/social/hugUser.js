import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import axios from "axios";
import 'dotenv/config'



export default {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone")
    .addUserOption(option => option.setName("user").setDescription("The user to hug").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos besarnos a uno mismo 
    if (targetUser.id === user.id) {
      await interaction.deferReply({
        ephemeral: true
      })
      return await interaction.editReply({
        content: "You can't hug yourself",
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
      'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmZrbWFvdGVvZWZxam1tNGQ5YjgwOTJ6Ym9iejgxc2l4Ym5xaGMxcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PHZ7v9tfQu0o0/giphy.webp',
      'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmZrbWFvdGVvZWZxam1tNGQ5YjgwOTJ6Ym9iejgxc2l4Ym5xaGMxcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/49mdjsMrH7oze/200.webp'
    ]

    try {
      const response = await axios.get(`https://api.giphy.com/v1/gifs/random`, {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          tag: "anime hug",
          rating: "g" // contenido para todo publico
        }
      })
      const ramdomGiff = gifs[Math.floor(Math.random() * gifs.length)]

      const gifUrl = response.data.data?.images?.original?.url || ramdomGiff

      const embed = new EmbedBuilder()
        .setColor('#1EE9E9')
        .setDescription(`**${user}** hugged **${targetUser}**! 🫢`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      console.log('Error al obtener el gif', error)
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the hug still counts.🫢",
      })
    }



  },
}