const { SlashCommandBuilder } = require("discord.js");

module.exports = {
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

    delete require.cache[
      require.resolve(`../${command.category}/${command.data.name}.js`)
    ];

    try {
      interaction.client.commands.delete(command.data.name);
      const newCommand = require(`../${command.category}/${command.data.name}.js`);
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
