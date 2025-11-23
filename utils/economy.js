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
  const result = await pool.query(
    "SELECT mantiCoins FROM economy WHERE userId = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return result.rows[0].mantiCoins;
}

/**
 * Añade MantiCoins a un usuario. Si el usuario no existe, lo crea.
 * @param {string} userId - El ID del usuario.
 * @param {number} amount - La cantidad a añadir.
 * @returns {number} - El nuevo saldo.
 */

export const addCoins = async (userId, amount) => {
  // Consulta con 'ON CONFLICT': Si el usuario existe, actualiza; si no, inserta.
  cosnt result = await pool.query(
  `INSERT INTO economy (userId, mantiCoins)
    VALUES ($1, $2)
    ON CONFLICT (userId)
    DO UPDATE SET mantiCoins = economy.mantiCoins + $2
    RETURNING mantiCoins`,
  [userId, amount]
);

  return result.rows[0].mantiCoins

}

// obtiene la ultima fecha del trabajo/daily
export const getWorkData = async (userId) => {
  let result = await pool.query('SELECT lastDaily FROM economy WHERE userId = $1', [userId]);

  // Si no existe, devuelve una fecha antigua (new Date(0)) para que pueda usar el comando inmediatamente.
  if (result.rows.length === 0) {
    return { lastDaily: new Date(0) };
  }

  return { lastDaily: result.rows[0].lastdaily };
};

// Actualizar la fecha de trabajo/daily
export const updateWorkTime = async (userId) => {
  const currentTime = new Date();
  await pool.query(
    `
        UPDATE economy
        SET lastDaily = $1
        WHERE userId = $2
        `,
    [currentTime, userId]
  );
}

// Elimina monedas 
export const removeCoins = async (userId, amount) => {
  const result = await pool.query('SELECT mantiCoins FROM economy WHERE userId = $1', [userId])
  if (result.rows.length === 0 || result.rows[0].mantiCoins < amount) {
    return false; // No hay suficientes monedas
  }

  const updateResult = await pool.query(
    `
      UPDATE economy
      SET mantiCoins = mantiCoins - $1
      WHERE userId = $2
      RETURNING mantiCoins
    `,
    [amount, userId]
  );
  return updateResult.rows[0].mantiCoins;
}