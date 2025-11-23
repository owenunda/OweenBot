import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getGuildLanguage } from "../../utils/language.js";
import { t } from "../../utils/i18n.js";

export default {
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
    const lang = await getGuildLanguage(interaction.guildId);
    const reason = interaction.options.getString('reason') ?? t(lang, 'moderation.no_reason');
    
  await interaction.guild.members.kick(target);
  return interaction.reply(t(lang, 'moderation.kicked', { user: target.user.username, reason: reason }));
  },
};
