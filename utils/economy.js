import { pool } from "../database/connect.js";

/*
  modulo de economia: funciones para la economia del bot (con la tabla economy)
  Ahora con soporte para guildId - cada servidor tiene su propia economía
*/

// ------------------------------------
// FUNCIONES PÚBLICAS
// ------------------------------------

/**
 * Obtiene el saldo de un usuario en un servidor específico. Si no existe en la DB, devuelve 0.
 * @param {string} userId - El ID del usuario.
 * @param {string} guildId - El ID del servidor.
 * @returns {number} - El saldo actual.
 */

export const getBalance = async (userId, guildId) => {
  try {
    const result = await pool.query(
      "SELECT manticoins FROM economy WHERE userId = $1 AND guildId = $2",
      [userId, guildId]
    );

    if (result.rows.length === 0) {
      return 0;
    }
    return result.rows[0].manticoins;
  } catch (error) {
    console.error('❌ Error al obtener balance:', error.message);
    return 0; // Retornar 0 en caso de error
  }
}

/**
 * Añade MantiCoins a un usuario en un servidor específico. Si el usuario no existe, lo crea.
 * @param {string} userId - El ID del usuario.
 * @param {string} guildId - El ID del servidor.
 * @param {number} amount - La cantidad a añadir.
 * @returns {number} - El nuevo saldo.
 */

export const addCoins = async (userId, guildId, amount) => {
  try {
    // Consulta con 'ON CONFLICT': Si el usuario existe en ese servidor, actualiza; si no, inserta.
    const result = await pool.query(
      `INSERT INTO economy (userId, guildId, manticoins)
      VALUES ($1, $2, $3)
      ON CONFLICT (userId, guildId)
      DO UPDATE SET manticoins = economy.manticoins + $3
      RETURNING manticoins`,
      [userId, guildId, amount]
    );

    return result.rows[0].manticoins;
  } catch (error) {
    console.error('❌ Error al añadir monedas:', error.message);
    throw error; // Re-lanzar el error para que el comando pueda manejarlo
  }
}

/**
 * Obtiene la ultima fecha del trabajo/daily de un usuario en un servidor específico
 * @param {string} userId - El ID del usuario.
 * @param {string} guildId - El ID del servidor.
 * @returns {object} - Objeto con lastDaily
 */
export const getWorkData = async (userId, guildId) => {
  try {
    let result = await pool.query(
      'SELECT lastDaily FROM economy WHERE userId = $1 AND guildId = $2', 
      [userId, guildId]
    );

    // Si no existe, devuelve una fecha antigua (new Date(0)) para que pueda usar el comando inmediatamente.
    if (result.rows.length === 0) {
      return { lastDaily: new Date(0) };
    }

    return { lastDaily: result.rows[0].lastdaily };
  } catch (error) {
    console.error('❌ Error al obtener datos de trabajo:', error.message);
    return { lastDaily: new Date(0) }; // Retornar fecha antigua en caso de error
  }
};

/**
 * Actualiza la fecha de trabajo/daily de un usuario en un servidor específico
 * @param {string} userId - El ID del usuario.
 * @param {string} guildId - El ID del servidor.
 */
export const updateWorkTime = async (userId, guildId) => {
  try {
    const currentTime = new Date();
    // Usar INSERT ON CONFLICT para crear el usuario si no existe
    await pool.query(
      `
        INSERT INTO economy (userId, guildId, manticoins, lastDaily)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (userId, guildId)
        DO UPDATE SET lastDaily = $3
        `,
      [userId, guildId, currentTime]
    );
  } catch (error) {
    console.error('❌ Error al actualizar tiempo de trabajo:', error.message);
    throw error;
  }
}

/**
 * Elimina monedas de un usuario en un servidor específico
 * @param {string} userId - El ID del usuario.
 * @param {string} guildId - El ID del servidor.
 * @param {number} amount - La cantidad a remover.
 * @returns {number|false} - El nuevo saldo o false si no hay suficientes monedas
 */
export const removeCoins = async (userId, guildId, amount) => {
  try {
    const currentBalance = await getBalance(userId, guildId);

    if (currentBalance < amount) {
      return false; // No hay suficientes monedas
    }

    const updateResult = await pool.query(
      `
      UPDATE economy
      SET manticoins = manticoins - $1
      WHERE userId = $2 AND guildId = $3
      RETURNING manticoins
    `,
      [amount, userId, guildId]
    );
    return updateResult.rows[0].manticoins;
  } catch (error) {
    console.error('❌ Error al remover monedas:', error.message);
    return false;
  }
}

/**
 * Obtiene el top 10 de usuarios con más MantiCoins GLOBAL (todos los servidores)
 * Suma todas las monedas de un usuario en todos los servidores
 * @returns {Array} - Array de objetos con userid, manticoins
 */
export const topUsersManticoins = async () => {
  try {
    const result = await pool.query(`
      SELECT userid, SUM(manticoins) as manticoins
      FROM public.economy
      GROUP BY userid
      ORDER BY SUM(manticoins) DESC
      LIMIT 10;
    `);

    return result.rows;
  } catch (error) {
    console.error('❌ Error al obtener top usuarios:', error.message);
    return []; // Retornar array vacío en caso de error
  }
}

/**
 * Obtiene el top 10 de usuarios con más MantiCoins en UN SERVIDOR ESPECÍFICO
 * @param {string} guildId - El ID del servidor.
 * @returns {Array} - Array de objetos con userid, manticoins, lastdaily
 */
export const topUsersManticoinsByGuild = async (guildId) => {
  try {
    const result = await pool.query(`
      SELECT userid, manticoins, lastdaily
      FROM public.economy
      WHERE guildId = $1
      ORDER BY manticoins DESC
      LIMIT 10;
    `, [guildId]);

    return result.rows;
  } catch (error) {
    console.error('❌ Error al obtener top usuarios del servidor:', error.message);
    return []; // Retornar array vacío en caso de error
  }
}