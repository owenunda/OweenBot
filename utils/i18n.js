import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesPath = path.join(__dirname, '../locales');
const locales = {};

// Cargar locales al iniciar
fs.readdirSync(localesPath).forEach(file => {
    if (file.endsWith('.json')) {
        const lang = file.split('.')[0];
        const data = JSON.parse(fs.readFileSync(path.join(localesPath, file), 'utf-8'));
        locales[lang] = data;
    }
});

/**
 * Traduce una clave al idioma especificado.
 * @param {string} lang - El código del idioma ('es', 'en').
 * @param {string} key - La clave de la traducción (ej. 'hug.self_hug').
 * @param {object} args - Argumentos para reemplazar en la cadena (ej. { user: 'Owen' }).
 * @returns {string} La cadena traducida.
 */
export function t(lang, key, args = {}) {
    const keys = key.split('.');
    let value = locales[lang] || locales['es']; // Fallback a español

    for (const k of keys) {
        value = value[k];
        if (!value) break;
    }

    if (!value) {
        // Fallback a español si no se encuentra en el idioma seleccionado
        if (lang !== 'es') return t('es', key, args);
        return key; // Si no existe ni en español, devuelve la clave
    }

    // Reemplazo de variables {variable}
    return value.replace(/{(\w+)}/g, (_, v) => args[v] !== undefined ? args[v] : `{${v}}`);
}
