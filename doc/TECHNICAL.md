## OweenBot — Documentación técnica

Este documento reúne toda la información técnica para instalar, configurar, desplegar comandos (/) y desarrollar el bot.

### Requisitos

- Node.js 20+ (recomendado 22)
- Una app/bot en Discord (token)

### Variables de entorno (.env)

```
TOKEN=tu_token_de_bot
CLIENT_ID=tu_client_id_de_aplicacion
```

### Instalación

```bash
npm install
```

### Despliegue de comandos (/) globales

```bash
npm run deployC
```

Nota: Los comandos globales pueden tardar minutos en propagarse. Si deseas despliegue instantáneo por servidor (guild), adapta `deploy-commands.js` a `Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)`.

### Ejecución

```bash
npm run start   # arranque normal
npm run dev     # reinicia al detectar cambios
```

### Estructura del proyecto

```
commands/
  fun/
    echo.js
    hola.js
    ping.js
    valorantRandom.js
  moderation/
    banned.js
    kick.js
    reload.js
  utility/
    avatar.js
    server.js
    user.js
events/
  interactionCreate.js
  ready.js
deploy-commands.js
index.js
package.json
README.md
TECHNICAL.md
```

### Notas de implementación

- El proyecto usa ESM (`"type":"module"`).
- Carga dinámica de comandos al iniciar y recarga por `/reload`.
- Cada comando obtiene `category` (carpeta) y `fileName` (archivo real) para resolver importaciones en recarga.
- `deploy-commands.js` recorre `commands/**` y publica los datos `data.toJSON()`.
- Los mensajes del bot están en español y conservan placeholders útiles.

### Solución de problemas

- “Hubo un error al ejecutar este comando!”
  - Verifica el nombre del comando y cooldown.

- No conecta el bot / token inválido
  - Revisa `TOKEN` en `.env` (sin comillas, sin espacios).

- (/) comandos no aparecen tras el deploy
  - Espera algunos minutos o usa despliegue por guild.

- Recarga falla con “No se encontró módulo…”
  - Asegúrate de pasar el nombre del slash command a `/reload` (ej. `hola-pepe`, `random-agent`).

### Seguridad 

- Añade `.env` a `.gitignore` y evita publicarlo.
- Regenera tu token si se expone.

### Licencia

ISC — ver `package.json`.
