const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Select a member and kick them (but not really).")
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("The member to kick")
        .setRequired(true))
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),    
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    
  await interaction.guild.members.kick(target);
  return interaction.reply(`Expulsión: ${target.user.username} — Motivo: ${reason}`);
  },
};
