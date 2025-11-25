import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setGuildLanguage, getGuildLanguage } from '../../utils/language.js';
import { t } from '../../utils/i18n.js';

export default {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Change the bot\'s language / Cambia el idioma del bot')
        .addStringOption(option =>
            option.setName('lang')
                .setDescription('The language to set / El idioma a establecer')
                .setRequired(true)
                .addChoices(
                    { name: 'Español', value: 'es' },
                    { name: 'English', value: 'en' }
                )
        ),
        //.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const langCode = interaction.options.getString('lang');
        const guildId = interaction.guildId;

        // We can't easily get the language here if it's not in a guild, 
        // but we can default to Spanish or try to get it from the user's locale if we wanted.
        // For now, hardcoded response for non-guild usage is acceptable or we can use a default 'es'.
        if (!guildId) {
            return interaction.reply({ content: t('es', 'common.only_guild'), ephemeral: true });
        }

        try {
            await setGuildLanguage(guildId, langCode);
            // Respond in the new language
            const response = t(langCode, 'language.set', { lang: langCode === 'es' ? 'Español' : 'English' });
            await interaction.reply(response);
        } catch (error) {
            console.error(error);
            // Use the target language if possible, otherwise default to 'es'
            await interaction.reply({ content: t(langCode, 'common.error'), ephemeral: true });
        }
    },
};
