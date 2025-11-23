import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import NekosLife from "nekos.life";

const nekoClient = new NekosLife();

export default {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone! 🫢")
    .addUserOption(option => option.setName("user").setDescription("The user to hug").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const user = interaction.user;

    // Evitamos abrazarnos a uno mismo 
    if (targetUser.id === user.id) {
      return await interaction.reply({
        content: "You can't hug yourself! 🥺",
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

    // DeferReply: Avisamos a Discord que estamos "pensando"
    await interaction.deferReply();

    try {
      const response = await nekoClient.hug();
      const imageUrl = response.url;

      const embed = new EmbedBuilder()
        .setColor('#1EE9E9')
        .setDescription(`**${user}** hugged **${targetUser}**! 🫢`)
        .setImage(imageUrl)
        .setTimestamp()
        .setFooter({ text: `Requested by ${user.username}` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching hug image:', error);
      
      await interaction.editReply({
        content: "There was an error while searching for the GIF, but the hug still counts. 🫢",
      });
    }
  },
};