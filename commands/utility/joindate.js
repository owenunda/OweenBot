import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('joindate')
        .setDescription('Shows when a user joined the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose join date you want to see')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        if (!member) {
            return interaction.reply({ content: '❌ Could not find that user in the server.', ephemeral: true });
        }

        const joinedAt = member.joinedAt;
        const joinedTimestamp = Math.floor(joinedAt.getTime() / 1000);
        
        // Calculate how long they've been in the server
        const now = new Date();
        const diff = now - joinedAt;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        let timeInServer = '';
        if (years > 0) {
            timeInServer = `${years} year${years > 1 ? 's' : ''}`;
            const remainingMonths = Math.floor((days % 365) / 30);
            if (remainingMonths > 0) {
                timeInServer += ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
            }
        } else if (months > 0) {
            timeInServer = `${months} month${months > 1 ? 's' : ''}`;
            const remainingDays = days % 30;
            if (remainingDays > 0) {
                timeInServer += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
            }
        } else {
            timeInServer = `${days} day${days !== 1 ? 's' : ''}`;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📅 Server Join Date')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setDescription(`**${targetUser.tag}** joined the server:`)
            .addFields(
                { name: 'Date', value: `<t:${joinedTimestamp}:F>`, inline: false },
                { name: 'Time Ago', value: `<t:${joinedTimestamp}:R>`, inline: true },
                { name: 'Time in Server', value: timeInServer, inline: true }
            )
            .setFooter({ text: `ID: ${targetUser.id}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
