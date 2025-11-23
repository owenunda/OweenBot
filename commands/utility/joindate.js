import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('joindate')
		.setDescription('Shows join date and first message of a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user whose information you want to see')
				.setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;
		const member = await interaction.guild.members.fetch(targetUser.id);

		if (!member) {
			return interaction.editReply({ content: '❌ Could not find that user in the server.' });
		}

		const joinedAt = member.joinedAt;
		const joinedTimestamp = Math.floor(joinedAt.getTime() / 1000);

		// Search for oldest message
		let oldestMessage = null;
		let oldestDate = null;

		try {
			const channels = await interaction.guild.channels.fetch();
			const textChannels = channels.filter(c => c.isTextBased() && c.viewable);

			for (const [, channel] of textChannels) {
				try {
					const messages = await channel.messages.fetch({ limit: 100 });
					const userMessages = messages.filter(m => m.author.id === targetUser.id);
					
					if (userMessages.size > 0) {
						const oldest = userMessages.last();
						if (!oldestMessage || oldest.createdTimestamp < oldestMessage.createdTimestamp) {
							oldestMessage = oldest;
							oldestDate = oldest.createdAt;
						}
					}
				} catch (error) {
					// Skip channels we can't read
					continue;
				}
			}
		} catch (error) {
			console.error('Error searching messages:', error);
		}

		const embed = new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle('📅 User Information')
			.setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${targetUser.tag}**`);

		// Last join date
		embed.addFields({ 
			name: '📥 Last Server Join', 
			value: `<t:${joinedTimestamp}:F>\n<t:${joinedTimestamp}:R>`, 
			inline: false 
		});

		// Oldest message found
		if (oldestMessage) {
			const oldestTimestamp = Math.floor(oldestDate.getTime() / 1000);
			const now = new Date();
			const diff = now - oldestDate;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const years = Math.floor(days / 365);
			const months = Math.floor((days % 365) / 30);

			let timeStr = '';
			if (years > 0) {
				timeStr = `${years} year${years > 1 ? 's' : ''}`;
				if (months > 0) {
					timeStr += ` and ${months} month${months > 1 ? 's' : ''}`;
				}
			} else if (months > 0) {
				const remainingDays = days % 30;
				timeStr = `${months} month${months > 1 ? 's' : ''}`;
				if (remainingDays > 0) {
					timeStr += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
				}
			} else {
				timeStr = `${days} day${days !== 1 ? 's' : ''}`;
			}

			embed.addFields(
				{ 
					name: '💬 First Message Found', 
					value: `<t:${oldestTimestamp}:F>\n<t:${oldestTimestamp}:R>`, 
					inline: false 
				},
				{
					name: '⏱️ Estimated Time in Server',
					value: timeStr,
					inline: true
				},
				{
					name: '📍 Channel',
					value: `<#${oldestMessage.channelId}>`,
					inline: true
				}
			);
		} else {
			embed.addFields({ 
				name: '💬 First Message', 
				value: 'No messages found in the server', 
				inline: false 
			});
		}

		embed.setFooter({ text: `ID: ${targetUser.id}` });
		embed.setTimestamp();

		return interaction.editReply({ embeds: [embed] });
	},
};
