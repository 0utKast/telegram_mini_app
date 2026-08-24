import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Enviar mensaje de texto a un chat o usuario de Telegram
 */
export async function sendTelegramMessage(chatId, text, extra = {}) {
  if (!BOT_TOKEN || BOT_TOKEN === 'TU_BOT_TOKEN_AQUI') {
    console.log(`[Bot Mock] 📨 Mensaje para chat ${chatId}:\n${text}`);
    return { ok: true, mock: true };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...extra
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Bot Error] Error de Telegram API:', data.description);
    }
    return data;
  } catch (err) {
    console.error('[Bot Error] Error de red al enviar mensaje:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Enviar recibo detallado de confirmación de reserva
 */
export async function sendBookingReceipt(booking) {
  const {
    id,
    userId,
    userName,
    userHandle,
    serviceTitle,
    price,
    bookingDate,
    bookingTime,
    bookingType,
    notes
  } = booking;

  const handleText = userHandle ? ` (@${userHandle})` : '';
  const notesText = notes ? `\n📝 <b>Notas:</b> <i>${escapeHtml(notes)}</i>` : '';

  const html = `
🎉 <b>¡Reserva Confirmada! #RES-${id}</b>
━━━━━━━━━━━━━━━━━━━━━
💼 <b>Servicio:</b> ${escapeHtml(serviceTitle)}
💰 <b>Total:</b> <b>${price.toFixed(2)} €</b>
📅 <b>Fecha:</b> ${bookingDate}
⏰ <b>Hora:</b> ${bookingTime}
📍 <b>Modalidad:</b> ${bookingType}
👤 <b>Cliente:</b> ${escapeHtml(userName)}${handleText}${notesText}
━━━━━━━━━━━━━━━━━━━━━
✅ <i>Hemos recibido tu solicitud correctamente. Recibirás el enlace de la videollamada / confirmación antes de la fecha.</i>
`;

  return await sendTelegramMessage(userId, html.trim());
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Iniciar Long Polling sencillo para responder a /start y comandos
 */
let isPolling = false;
let lastOffset = 0;

export async function startBotPolling(webAppUrl) {
  if (!BOT_TOKEN || BOT_TOKEN === 'TU_BOT_TOKEN_AQUI') {
    console.log('[Bot] ℹ️ Bot no configurado (falta TELEGRAM_BOT_TOKEN en .env). Modo simulación activo.');
    return;
  }

  if (isPolling) return;
  isPolling = true;
  console.log('[Bot] 🤖 Bot de Telegram iniciado en modo polling.');

  async function poll() {
    if (!isPolling) return;
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastOffset + 1}&timeout=30`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastOffset = update.update_id;
          if (update.message && update.message.text) {
            await handleBotMessage(update.message, webAppUrl);
          }
        }
      }
    } catch (e) {
      // Reintentar en 3s en caso de error de red
      await new Promise((r) => setTimeout(r, 3000));
    }
    // Siguiente ciclo de polling
    setTimeout(poll, 500);
  }

  poll();
}

async function handleBotMessage(message, webAppUrl) {
  const chatId = message.chat.id;
  const text = message.text;
  const firstName = message.from.first_name || 'Desarrollador';

  if (text.startsWith('/start') || text.startsWith('/app')) {
    const welcomeText = `
👋 <b>¡Hola, ${escapeHtml(firstName)}!</b>

Bienvenido a <b>DevStudio</b>, tu espacio de consultoría técnica y desarrollo web a medida.

Pulsa el botón a continuación para explorar nuestro catálogo de servicios, ver tarifas y reservar tu sesión en tiempo real.
    `.trim();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 Abrir Catálogo & Reservas',
            web_app: { url: webAppUrl || process.env.BASE_URL || 'https://localhost:3000' }
          }
        ]
      ]
    };

    await sendTelegramMessage(chatId, welcomeText, { reply_markup: inlineKeyboard });
  }
}
