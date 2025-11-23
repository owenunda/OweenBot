import { pool } from "../database/connect.js";

/*
  modulo de economia: funciones para la economia del bot (con la tabla economy)
*/

// ------------------------------------
// FUNCIONES PÚBLICAS
// ------------------------------------

/**
 * Obtiene el saldo de un usuario. Si no existe en la DB, devuelve 0.
 * @param {string} userId - El ID del usuario.
 * @returns {number} - El saldo actual.
 */

export const getBalance = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT manticoins FROM economy WHERE userId = $1",
      [userId]
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
 * Añade MantiCoins a un usuario. Si el usuario no existe, lo crea.
 * @param {string} userId - El ID del usuario.
 * @param {number} amount - La cantidad a añadir.
 * @returns {number} - El nuevo saldo.
 */

export const addCoins = async (userId, amount) => {
  try {
    // Consulta con 'ON CONFLICT': Si el usuario existe, actualiza; si no, inserta.
    const result = await pool.query(
      `INSERT INTO economy (userId, manticoins)
      VALUES ($1, $2)
      ON CONFLICT (userId)
      DO UPDATE SET manticoins = economy.manticoins + $2
      RETURNING manticoins`,
      [userId, amount]
    );

    return result.rows[0].manticoins;
  } catch (error) {
    console.error('❌ Error al añadir monedas:', error.message);
    throw error; // Re-lanzar el error para que el comando pueda manejarlo
  }
}

// obtiene la ultima fecha del trabajo/daily
export const getWorkData = async (userId) => {
  try {
    let result = await pool.query('SELECT lastDaily FROM economy WHERE userId = $1', [userId]);

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

// Actualizar la fecha de trabajo/daily
export const updateWorkTime = async (userId) => {
  try {
    const currentTime = new Date();
    // Usar INSERT ON CONFLICT para crear el usuario si no existe
    await pool.query(
      `
        INSERT INTO economy (userId, manticoins, lastDaily)
        VALUES ($1, 0, $2)
        ON CONFLICT (userId)
        DO UPDATE SET lastDaily = $2
        `,
      [userId, currentTime]
    );
  } catch (error) {
    console.error('❌ Error al actualizar tiempo de trabajo:', error.message);
    throw error;
  }
}

// Elimina monedas 
export const removeCoins = async (userId, amount) => {
  try {
    const currentBalance = await getBalance(userId);

    if (currentBalance < amount) {
      return false; // No hay suficientes monedas
    }

    const updateResult = await pool.query(
      `
      UPDATE economy
      SET manticoins = manticoins - $1
      WHERE userId = $2
      RETURNING manticoins
    `,
      [amount, userId]
    );
    return updateResult.rows[0].manticoins;
  } catch (error) {
    console.error('❌ Error al remover monedas:', error.message);
    return false;
  }
}

export const topUsersManticoins = async () => {
  try {
    const result = await pool.query(`SELECT userid, manticoins, lastdaily
      FROM public.economy
      ORDER BY manticoins DESC
      LIMIT 10;`);

    return result.rows;
  } catch (error) {
    console.error('❌ Error al obtener top usuarios:', error.message);
    return []; // Retornar array vacío en caso de error
  }
}