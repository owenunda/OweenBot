import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),

        async execute(interaction) {
            const target = interaction.options.getUser('target');
            const lang = await getGuildLanguage(interaction.guildId);
            const reason = interaction.options.getString('reason') ?? t(lang, 'moderation.no_reason');
    
			await interaction.reply(t(lang, 'moderation.banned', { user: target.username, reason: reason }));
            await interaction.guild.members.ban(target);
        },
};