import pg from 'pg';
import 'dotenv/config'; 
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

// 1. Crear el Pool de Conexiones
const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
    // La opción ssl: true es importante para conexiones a servicios en la nube como Supabase
    ssl: { rejectUnauthorized: false } 
});

/**
 * Función para asegurar que la tabla de economía existe.
 */
const initializeDatabase = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS economy (
                userId VARCHAR(20) PRIMARY KEY,
                mantiCoins INTEGER DEFAULT 0,
                lastDaily TIMESTAMP WITH TIME ZONE DEFAULT '1970-01-01'
            );
        `;
        // Ejecutamos la creación de la tabla
        await pool.query(createTableQuery); 
        console.log('✅ PostgreSQL: Tabla "economy" asegurada y lista.');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        process.exit(1);
    }
};

// 2. Exportar el Pool y la función de conexión
export { pool };
export const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()'); 
        console.log('🔗 Conectado a PostgreSQL (Supabase).');
        await initializeDatabase();
    } catch (error) {
        console.error('❌ Error fatal de conexión a PostgreSQL:', error.message);
        process.exit(1);
    }
};