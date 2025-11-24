import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildLanguage } from '../../utils/language.js';

export default {
	data: new SlashCommandBuilder()
		.setName('rpg')
		.setDescription('RPG game commands')
		.setDescriptionLocalizations({
			'es-ES': 'Comandos del juego de RPG'
		})
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Get information about the RPG game')
				.setDescriptionLocalizations({
					'es-ES': 'Obtén información sobre el juego de RPG'
				})
		),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const lang = await getGuildLanguage(interaction.guildId);

		switch (subcommand) {
			case 'info': {
				const embed = new EmbedBuilder()
					.setColor('#8B4513')
					.setTitle('⚔️ Bienvenido al Reino de las Leyendas ⚔️')
					.setDescription(
						'Un mundo de magia, aventuras y peligros te espera. Crea tu personaje, elige tu raza y clase, y embárcate en una épica aventura medieval fantástica.'
					)
					.addFields(
						{
							name: '🎭 Razas Disponibles',
							value: '```\n• Humano - Versátiles y adaptables\n• Elfo - Maestros de la magia y la naturaleza\n• Enano - Resistentes y habilidosos artesanos\n```',
							inline: false
						},
						{
							name: '⚔️ Sistema de Combate',
							value: 'Combate por turnos con un sistema dinámico que combina estrategia, habilidades y un toque de suerte.',
							inline: false
						},
						{
							name: '🎒 Características',
							value: '```\n✓ Sistema de inventario\n✓ Equipo y armas\n✓ Encantamientos mágicos\n✓ Misiones épicas\n✓ Enemigos variados\n✓ IA integrada para narrativa\n```',
							inline: false
						},
						{
							name: '🚀 Empezar',
							value: 'Usa `/rpg create` para crear tu primer personaje y comenzar tu aventura.',
							inline: false
						}
					)
					.setFooter({ text: '¡La aventura te espera!' })
					.setTimestamp();

				await interaction.reply({ embeds: [embed] });
				break;
			}
			default:
				await interaction.reply({ content: 'Subcomando no implementado.', ephemeral: true });
		}
	},
};
