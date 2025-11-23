CREATE TABLE economy (
    userId VARCHAR(20),
    guildId VARCHAR(255) NOT NULL,
    mantiCoins INTEGER DEFAULT 0,
    lastDaily TIMESTAMP WITH TIME ZONE DEFAULT '1970-01-01',
    PRIMARY KEY (userId, guildId)
);

/*
    implementacion y modificacion para la tabla economy, y para que funcione correctamente los tops de monedas
*/

-- PASO 1: Eliminar todos los registros existentes
TRUNCATE TABLE public.economy;
-- PASO 2: Asegurarnos de que la columna guildId existe
ALTER TABLE public.economy 
ADD COLUMN IF NOT EXISTS guildId VARCHAR(255) NOT NULL;
-- PASO 3: Crear índice
CREATE INDEX IF NOT EXISTS idx_economy_guildid ON public.economy(guildId);
-- PASO 4: Eliminar la clave primaria antigua
ALTER TABLE public.economy 
DROP CONSTRAINT IF EXISTS economy_pkey;
-- PASO 5: Crear nueva clave primaria compuesta
ALTER TABLE public.economy 
ADD CONSTRAINT economy_pkey PRIMARY KEY (userId, guildId);

-- Tabla para configuraciones de idioma por servidor
CREATE TABLE guild_settings (
    guildId VARCHAR(20) PRIMARY KEY,
    language VARCHAR(5) DEFAULT 'es'
);