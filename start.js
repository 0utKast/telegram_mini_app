import { spawn } from 'child_process';
import dotenv from 'dotenv';
import './server/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function updateTelegramBotMenu(webAppUrl) {
  if (!BOT_TOKEN || BOT_TOKEN === 'TU_BOT_TOKEN_AQUI') return;

  try {
    const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meRes.json();
    const botName = meData.ok ? `@${meData.result.username}` : 'Bot';

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🚀 Servicios & Reservas',
          web_app: { url: webAppUrl }
        }
      })
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Botón de menú configurado para ${botName}`);
    } else {
      console.warn(`⚠️ Error al configurar menú:`, data.description);
    }
  } catch (err) {
    console.error('Error al conectar con Telegram Bot API:', err.message);
  }

  process.env.BASE_URL = webAppUrl;
}

function startCloudflareTunnel() {
  console.log('\n⏳ Iniciando túnel seguro Cloudflare (trycloudflare.com)...');

  const cf = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://localhost:${PORT}`], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let urlFound = false;

  function handleData(chunk) {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
      urlFound = true;
      const tunnelUrl = match[0];

      console.log(`\n🎉 ======================================================`);
      console.log(`🚀 ¡MINI APP EN VIVO Y ESTABLE CON CLOUDFLARE!`);
      console.log(`======================================================`);
      console.log(`🔗 URL PÚBLICA HTTPS: ${tunnelUrl}`);
      console.log(`📱 Carga directa en Telegram (Web y Móvil) sin pantallas intermedias`);
      console.log(`======================================================\n`);

      updateTelegramBotMenu(tunnelUrl);
    }
  }

  cf.stdout.on('data', handleData);
  cf.stderr.on('data', handleData);

  cf.on('error', (err) => {
    console.error('Error al ejecutar Cloudflare Tunnel:', err.message);
  });

  cf.on('close', (code) => {
    console.log(`🔴 Cloudflare Tunnel cerrado (código: ${code}).`);
  });

  process.on('SIGINT', () => {
    cf.kill();
    process.exit();
  });
}

startCloudflareTunnel();
