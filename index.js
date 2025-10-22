import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const moduleUrl = pathToFileURL(filePath).href;
		const imported = await import(moduleUrl);
		const command = imported.default ?? imported;
		if ('data' in command && 'execute' in command) {
			// Asegura que cada comando conozca su categoría (subcarpeta) para funciones como reload
			command.category = command.category ?? folder;
			// Guarda el nombre real del archivo (sin extensión) para reload
			command.fileName = command.fileName ?? path.parse(file).name;
			client.commands.set(command.data.name, command);
		} else {
				console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene la propiedad requerida "data" o "execute". - index.js:32`);
		}
	}
}

client.once(Events.ClientReady, c => {
	console.log(`¡Listo! Conectado como ${c.user.tag} - index.js:38`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
	console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}. - index.js:46`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Por favor espera, estás en periodo de espera para \`${command.data.name}\`. Podrás usarlo de nuevo <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "Hubo un error al ejecutar este comando!", ephemeral: true });
		} else {
			await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
		}
	}
});

client.login(process.env.TOKEN);