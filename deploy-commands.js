import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const moduleUrl = pathToFileURL(filePath).href;
		const imported = await import(moduleUrl);
		const command = imported.default ?? imported;
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene la propiedad requerida "data" o "execute". - deploy-commands.js:30`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Empezando a actualizar ${commands.length} comandos de la aplicación (/) - deploy-commands.js:41`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Se recargaron con éxito ${data.length} comandos de la aplicación (/) - deploy-commands.js:49`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();