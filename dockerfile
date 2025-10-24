# Usa la versión LTS actual
FROM node:22.21.0-alpine

# Crea usuario no-root (mejor seguridad)
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# Copiamos package-lock y package.json para reproducibilidad
COPY package*.json ./

# Instalamos dependencias de producción solo (más liviano)
RUN npm ci --omit=dev

# Copiamos el código
COPY . .

# Cambiamos permisos y usuario
RUN chown -R app:app /app
USER app

# Puerto opcional (si usas express)
EXPOSE 3000

# Variables de entorno por defecto seguras
ENV NODE_ENV=production
ENV PORT=3000

# Comando de arranque (usa tu script "start" del package.json)
CMD ["npm", "start"]
