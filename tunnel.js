import localtunnel from 'localtunnel';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

console.log(`\n======================================================`);
console.log(`🌐 Creando túnel HTTPS seguro para Telegram Mini App...`);
console.log(`======================================================\n`);

(async () => {
  try {
    const tunnel = await localtunnel({ port: PORT });

    console.log(`✅ ¡Túnel HTTPS generado con éxito!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔗 URL PÚBLICA PARA TELEGRAM (HTTPS):`);
    console.log(`👉 ${tunnel.url}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`📋 Pasos para vincular en Telegram (@BotFather):`);
    console.log(` 1. Habla con @BotFather en Telegram.`);
    console.log(` 2. Envía el comando: /setmenubutton`);
    console.log(` 3. Selecciona tu bot.`);
    console.log(` 4. Pega la URL anterior (${tunnel.url}).`);
    console.log(` 5. Dale un título al botón (ej. "🚀 Servicios").\n`);
    console.log(`⚠️ Mantén este script abierto mientras realizas las pruebas.`);

    tunnel.on('close', () => {
      console.log('🔴 Túnel cerrado.');
    });

    tunnel.on('error', (err) => {
      console.error('Error en el túnel:', err);
    });

    process.on('SIGINT', () => {
      tunnel.close();
      process.exit();
    });
  } catch (err) {
    console.error('Error al iniciar el túnel:', err.message);
  }
})();
