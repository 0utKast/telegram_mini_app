import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB, getServices, getServiceById, createBooking, getBookingsByUser, upsertUser } from './db.js';
import { validateTelegramInitData } from './auth.js';
import { sendBookingReceipt, startBotPolling } from './bot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Inicializar base de datos SQLite
initDB();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  // Permitir explícitamente que la Mini App se incruste en WebView de Telegram y Telegram Web
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors * 'self' https://*.telegram.org https://web.telegram.org;");
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// ----------------------------------------------------
// RUTAS DE LA API
// ----------------------------------------------------

// 1. Estado y Configuración del Servidor
app.get('/api/config', (req, res) => {
  res.json({
    ok: true,
    botConfigured: Boolean(BOT_TOKEN && BOT_TOKEN !== 'TU_BOT_TOKEN_AQUI'),
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString()
  });
});

// 2. Obtener lista de servicios / catálogo
app.get('/api/services', (req, res) => {
  try {
    const category = req.query.category || null;
    const services = getServices(category);
    res.json({ ok: true, data: services });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 3. Obtener detalle de un servicio
app.get('/api/services/:id', (req, res) => {
  try {
    const service = getServiceById(parseInt(req.params.id, 10));
    if (!service) {
      return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });
    }
    res.json({ ok: true, data: service });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 4. Crear nueva reserva
app.post('/api/bookings', async (req, res) => {
  try {
    const { initData, serviceId, bookingDate, bookingTime, bookingType, notes, devUser } = req.body;

    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios (servicio, fecha o hora)' });
    }

    const service = getServiceById(parseInt(serviceId, 10));
    if (!service) {
      return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });
    }

    // Validar usuario
    let user = null;
    if (initData) {
      const auth = validateTelegramInitData(initData, BOT_TOKEN);
      if (auth.validated && auth.user) {
        user = auth.user;
      }
    }

    // Fallback para modo desarrollo/simulador en navegador estándar
    if (!user) {
      if (devUser && devUser.id) {
        user = devUser;
      } else {
        user = { id: 1001, first_name: 'Cliente Web', username: 'cliente_demo' };
      }
    }

    // Guardar o actualizar usuario en DB
    upsertUser(user);

    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Cliente';
    const userHandle = user.username || null;

    // Crear la reserva en la base de datos
    const booking = createBooking({
      userId: user.id,
      userName: userName,
      userHandle: userHandle,
      serviceId: service.id,
      serviceTitle: service.title,
      price: service.price,
      bookingDate,
      bookingTime,
      bookingType: bookingType || 'Online (Videollamada)',
      notes: notes || ''
    });

    console.log(`[Reserva] ✅ Creada reserva #${booking.id} para ${userName} (${service.title})`);

    // Enviar recibo a Telegram si es un usuario real de Telegram
    if (user.id && user.id !== 1001) {
      sendBookingReceipt(booking).catch(err => {
        console.error('[Error envio recibo]:', err);
      });
    }

    res.json({ ok: true, data: booking });
  } catch (err) {
    console.error('[Booking Error]', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 5. Obtener historial de reservas del usuario
app.get('/api/bookings/my-bookings', (req, res) => {
  try {
    const initData = req.headers['x-telegram-init-data'] || req.query.initData;
    let userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

    if (initData) {
      const auth = validateTelegramInitData(initData, BOT_TOKEN);
      if (auth.validated && auth.user) {
        userId = auth.user.id;
      }
    }

    if (!userId) {
      userId = 1001; // ID demo por defecto en desarrollo
    }

    const bookings = getBookingsByUser(userId);
    res.json({ ok: true, data: bookings });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor Telegram Mini App activo en: http://localhost:${PORT}`);
  console.log(`📱 Frontend disponible para pruebas en tu navegador`);
  console.log(`======================================================\n`);

  // Iniciar bot si hay token
  startBotPolling(BASE_URL);
});
