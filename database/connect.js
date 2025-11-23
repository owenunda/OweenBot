import pg from 'pg';
import 'dotenv/config'; 
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

// 1. Crear el Pool de Conexiones con configuración mejorada
const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
    ssl: { rejectUnauthorized: false },
    // Configuración de pool para mejor manejo de conexiones
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 10000, // Timeout de 10s para nuevas conexiones
});

// Manejar errores del pool para evitar crashes
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
    console.error('Detalles del error:', err);
    // No cerramos el proceso, permitimos que el pool maneje la reconexión
});

// Manejar cuando un cliente se conecta
pool.on('connect', (client) => {
    console.log('🔗 Nueva conexión establecida al pool de PostgreSQL');
});

// Manejar cuando un cliente se desconecta
pool.on('remove', (client) => {
    console.log('🔌 Cliente removido del pool de PostgreSQL');
});

/**
 * Función para asegurar que la tabla de economía existe.
 */
const initializeDatabase = async () => {
    let retries = 3;
    while (retries > 0) {
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
            return; // Salir si tiene éxito
        } catch (error) {
            retries--;
            console.error(`❌ Error al inicializar la base de datos (intentos restantes: ${retries}):`, error.message);
            if (retries === 0) {
                console.error('❌ No se pudo inicializar la base de datos después de varios intentos.');
                process.exit(1);
            }
            // Esperar 2 segundos antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};

// 2. Exportar el Pool y la función de conexión
export { pool };

export const endPool = async () => {
    try {
        await pool.end();
        console.log('🔗 Conexión a PostgreSQL cerrada correctamente.');
    } catch (error) {
        console.error('❌ Error al cerrar el pool:', error.message);
    }
};

export const connectDB = async () => {
    let retries = 3;
    while (retries > 0) {
        try {
            await pool.query('SELECT NOW()'); 
            console.log('🔗 Conectado a PostgreSQL (Supabase).');
            await initializeDatabase();
            return; // Salir si tiene éxito
        } catch (error) {
            retries--;
            console.error(`❌ Error de conexión a PostgreSQL (intentos restantes: ${retries}):`, error.message);
            if (retries === 0) {
                console.error('❌ No se pudo conectar a PostgreSQL después de varios intentos.');
                process.exit(1);
            }
            // Esperar 3 segundos antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};