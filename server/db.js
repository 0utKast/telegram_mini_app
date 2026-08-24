import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data.sqlite');
const db = new Database(DB_PATH);

// Habilitar WAL mode para alto rendimiento concurrente
db.pragma('journal_mode = WAL');

// Inicializar tablas
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '💼',
      popular INTEGER DEFAULT 0,
      badge TEXT,
      features_json TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, -- Telegram User ID
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_handle TEXT,
      service_id INTEGER NOT NULL,
      service_title TEXT NOT NULL,
      price REAL NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      booking_type TEXT DEFAULT 'Online (Videollamada)',
      notes TEXT,
      status TEXT DEFAULT 'CONFIRMADA', -- CONFIRMADA, EN_PROCESO, COMPLETADA, CANCELADA
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services (id)
    );
  `);

  // Sembrar datos iniciales si no existen
  const count = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
  if (count === 0) {
    const seedPath = path.join(__dirname, 'data/services.json');
    if (fs.existsSync(seedPath)) {
      const services = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      const insert = db.prepare(`
        INSERT INTO services (id, title, category, price, duration, description, icon, popular, badge, features_json)
        VALUES (@id, @title, @category, @price, @duration, @description, @icon, @popular, @badge, @features_json)
      `);

      const insertMany = db.transaction((items) => {
        for (const item of items) {
          insert.run({
            id: item.id,
            title: item.title,
            category: item.category,
            price: item.price,
            duration: item.duration,
            description: item.description,
            icon: item.icon,
            popular: item.popular ? 1 : 0,
            badge: item.badge || null,
            features_json: JSON.stringify(item.features || [])
          });
        }
      });

      insertMany(services);
      console.log(`[DB] ✅ Sembrados ${services.length} servicios en la base de datos.`);
    }
  }
}

export function getServices(category = null) {
  if (category && category !== 'Todos') {
    const rows = db.prepare('SELECT * FROM services WHERE category = ? ORDER BY popular DESC, id ASC').all(category);
    return rows.map(r => ({ ...r, features: JSON.parse(r.features_json || '[]') }));
  }
  const rows = db.prepare('SELECT * FROM services ORDER BY popular DESC, id ASC').all();
  return rows.map(r => ({ ...r, features: JSON.parse(r.features_json || '[]') }));
}

export function getServiceById(id) {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, features: JSON.parse(row.features_json || '[]') };
}

export function upsertUser(user) {
  if (!user || !user.id) return;
  const stmt = db.prepare(`
    INSERT INTO users (id, first_name, last_name, username, photo_url, last_seen)
    VALUES (@id, @first_name, @last_name, @username, @photo_url, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      username = excluded.username,
      photo_url = excluded.photo_url,
      last_seen = CURRENT_TIMESTAMP
  `);
  stmt.run({
    id: user.id,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    username: user.username || '',
    photo_url: user.photo_url || ''
  });
}

export function createBooking({ userId, userName, userHandle, serviceId, serviceTitle, price, bookingDate, bookingTime, bookingType, notes }) {
  const stmt = db.prepare(`
    INSERT INTO bookings (user_id, user_name, user_handle, service_id, service_title, price, booking_date, booking_time, booking_type, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADA')
  `);
  const result = stmt.run(userId, userName, userHandle, serviceId, serviceTitle, price, bookingDate, bookingTime, bookingType, notes);
  return {
    id: result.lastInsertRowid,
    userId,
    userName,
    userHandle,
    serviceId,
    serviceTitle,
    price,
    bookingDate,
    bookingTime,
    bookingType,
    notes,
    status: 'CONFIRMADA',
    createdAt: new Date().toISOString()
  };
}

export function getBookingsByUser(userId) {
  return db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC').all(userId);
}

export function getAllBookings() {
  return db.prepare('SELECT * FROM bookings ORDER BY id DESC').all();
}

export default db;
