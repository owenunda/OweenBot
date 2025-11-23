CREATE TABLE economy (
    -- Clave primaria: ID del usuario de Discord. VARCHAR(20) es suficiente para el ID.
    userId VARCHAR(20) PRIMARY KEY, 
    
    -- Saldo de MantiCoins. INTEGER es bueno para monedas enteras.
    mantiCoins INTEGER DEFAULT 0, 
    
    -- Columna para gestionar el tiempo de espera (cooldowns), guarda una fecha y hora.
    lastDaily TIMESTAMP WITH TIME ZONE DEFAULT '1970-01-01' 
);

