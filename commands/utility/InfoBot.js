import { SlashCommandBuilder } from 'discord.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('infobot')
    .setDescription('General information about the bot'),

  async execute(interaction) {
    const botUser = interaction.client.user;
    const botUptime = interaction.client.uptime;
    const uptimeSeconds = Math.floor((botUptime / 1000) % 60);
    const uptimeMinutes = Math.floor((botUptime / (1000 * 60)) % 60);
    const uptimeHours = Math.floor((botUptime / (1000 * 60 * 60)) % 24);
    const uptimeDays = Math.floor(botUptime / (1000 * 60 * 60 * 24));
    await interaction.reply(`Bot Information:
    - Name: ${botUser.username}
    - ID: ${botUser.id}
    - Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s
    - Created: ${botUser.createdAt.toDateString()}
    - Developer: oweenunda#9782 - username: manticora
    - Version: 1.0.0
    - GitHub: https://github.com/owenunda/OweenBot/
    - Language: JavaScript (Node.js)
    - Website: https://oweenbot.oween.software/
    - Library: discord.js
    - Hosting Platform: Koyeb
    - Support: [Discord Server](https://discord.gg/3rE9PRH95y)`);
  },
}