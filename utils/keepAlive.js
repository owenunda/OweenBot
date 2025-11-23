export const startSelfPing = (url) => {
  if (!url) {
    console.warn('[AutoPing] No se ha configurado la variable APP_URL')
    return
  }

  console.log('[AutoPing] Iniciando auto ping... Enviando ping cada 5 minutos')

  setInterval(async () => {
    try {
      const response = await fetch(url);

      if (response.ok) {
        console.log(`✅ [AutoPing] Ping exitoso a sí mismo (${response.status})`);
      } else {
        console.error(`❌ [AutoPing] El servidor respondió con error: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ [AutoPing] Error de conexión: ${error.message}`);
    }
  }, 5 * 60 * 1000); // 5 minutos
};
