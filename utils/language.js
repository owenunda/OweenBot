import { pool } from '../database/connect.js';

const cache = new Map();

/**
 * Obtiene el idioma de un servidor.
 * @param {string} guildId - El ID del servidor.
 * @returns {Promise<string>} El código del idioma ('es' o 'en').
 */
export async function getGuildLanguage(guildId) {
    if (cache.has(guildId)) {
        return cache.get(guildId);
    }

    try {
        const res = await pool.query('SELECT language FROM guild_settings WHERE guildId = $1', [guildId]);
        if (res.rows.length > 0) {
            const lang = res.rows[0].language;
            cache.set(guildId, lang);
            return lang;
        }
    } catch (error) {
        console.error('Error fetching guild language:', error);
    }

    // Default language
    return 'es';
}

/**
 * Establece el idioma de un servidor.
 * @param {string} guildId - El ID del servidor.
 * @param {string} language - El código del idioma ('es' o 'en').
 */
export async function setGuildLanguage(guildId, language) {
    try {
        await pool.query(
            'INSERT INTO guild_settings (guildId, language) VALUES ($1, $2) ON CONFLICT (guildId) DO UPDATE SET language = $2',
            [guildId, language]
        );
        cache.set(guildId, language);
    } catch (error) {
        console.error('Error setting guild language:', error);
        throw error;
    }
}
