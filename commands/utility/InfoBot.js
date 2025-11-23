import { SlashCommandBuilder } from 'discord.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('infobot')
    .setDescription('Informacion general sobre el bot.'),

  async execute(interaction) {
    const botUser = interaction.client.user;
    const botUptime = interaction.client.uptime;
    const uptimeSeconds = Math.floor((botUptime / 1000) % 60);
    const uptimeMinutes = Math.floor((botUptime / (1000 * 60)) % 60);
    const uptimeHours = Math.floor((botUptime / (1000 * 60 * 60)) % 24);
    const uptimeDays = Math.floor(botUptime / (1000 * 60 * 60 * 24));
    await interaction.reply(`Información del bot:
    - Nombre: ${botUser.username}
    - ID: ${botUser.id}
    - Tiempo de actividad: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s
    - Creado el: ${botUser.createdAt.toDateString()}
    - Desarrollador: oweenunda#9782 - username: manticora
    - Versión: 1.0.0
    - GitHub: https://github.com/owenunda/OweenBot/
    - Lenguaje: JavaScript (Node.js)
    - website: https://oweenbot.oween.software/
    - Librería: discord.js
    - Plataforma de hosting: Koyeb
    - Soporte: [Servidor de Discord](https://discord.gg/J9YrgE77)`);
  },
}