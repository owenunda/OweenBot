import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar')
		.addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),
	async execute(interaction) {
        const lang = await getGuildLanguage(interaction.guildId);
		const user = interaction.options.getUser('target') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(t(lang, 'avatar.title', { user: user.username }))
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`[${t(lang, 'avatar.link')}](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`);

		await interaction.reply({ embeds: [embed] });
	},
}