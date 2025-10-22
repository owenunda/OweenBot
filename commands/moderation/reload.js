import { SlashCommandBuilder } from "discord.js";
import path from 'node:path';

export default {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply(
        `No hay un comando con el nombre \`${commandName}\`!`
      );
    }

    try {
      // Construir URL del módulo a recargar relativa a este archivo usando el nombre real del archivo
      const baseUrl = new URL(import.meta.url);
      const fileName = command.fileName ?? command.data.name; // fallback por si acaso
      const targetUrl = new URL(`../${command.category}/${fileName}.js?update=${Date.now()}`, baseUrl);
      const imported = await import(targetUrl.href);
      const newCommand = imported.default ?? imported;
      // Asegurar metadatos para futuras recargas
      newCommand.category = newCommand.category ?? command.category;
      newCommand.fileName = newCommand.fileName ?? fileName;
      interaction.client.commands.delete(command.data.name);
      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply(
        `Comando \`${newCommand.data.name}\` recargado!`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(
        `Hubo un error al recargar el comando \`${command.data.name}\`:\n\`${error.message}\``
      );
    }
  },
};
