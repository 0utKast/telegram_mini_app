# 🚀 Telegram Mini App (TMA): DevStudio — Servicios & Reservas

Proyecto completo, funcional y de código abierto para crear una **Telegram Mini App (TMA)** desde cero con **Node.js, Express, SQLite y el SDK oficial de Telegram WebApp**.

---

## 🌟 Características Principales

* **🎨 Frontend Responsivo con Telegram SDK**:
  - Detección automática del tema de Telegram (modo claro y oscuro mediante variables CSS `--tg-theme-*`).
  - Botón principal nativo flotante (`Telegram.WebApp.MainButton`).
  - Botón de navegación nativo (`Telegram.WebApp.BackButton`).
  - Retroalimentación táctil (`Telegram.WebApp.HapticFeedback`).
  - **🧪 Modo Simulador de Navegador**: Permite probar y depurar toda la interfaz en Chrome, Safari o Firefox (`http://localhost:3000`) sin necesidad de abrir Telegram.
* **🔒 Seguridad Criptográfica**:
  - Validación de identidad sin contraseñas mediante **HMAC-SHA256** sobre la cadena firmada `initData`.
* **💾 Base de Datos Ligera**:
  - Persistencia local con **SQLite** (`better-sqlite3`) para servicios, usuarios y reservas.
* **🤖 Bot de Telegram Integrado**:
  - Respuestas automáticas al comando `/start` con botón para abrir la WebApp.
  - Generación y envío instantáneo de recibos en formato HTML directamente al chat privado del cliente al confirmar una reserva.
* **🌐 Túnel Seguro HTTPS**:
  - Integración con **Cloudflare Quick Tunnels** para pruebas en tiempo real desde el móvil o Telegram Web.

---

## 📁 Estructura del Proyecto

```
telegram-mini-app/
├── client/
│   ├── index.html        # Estructura de la Mini App (Catálogo, Reservas, Historial)
│   ├── style.css         # Estilos adaptados al tema de Telegram
│   └── app.js            # Lógica cliente + Telegram SDK + Modo Simulador
├── server/
│   ├── index.js          # Servidor Express y endpoints de API REST
│   ├── auth.js           # Validador criptográfico de initData (HMAC-SHA256)
│   ├── bot.js            # Lógica del Bot de Telegram y envío de recibos
│   ├── db.js             # Base de datos SQLite y operaciones CRUD
│   └── data/
│       └── services.json # Catálogo semilla inicial de servicios
├── start.js              # Arranque del servidor + Cloudflare Tunnel + Auto-config
├── package.json          # Dependencias y scripts
└── .env.example          # Plantilla de variables de entorno
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
npm install
```

### 2. Configurar variables de entorno
Copia la plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita `.env` y añade el token de tu bot de Telegram:
```env
PORT=3000
TELEGRAM_BOT_TOKEN=TU_BOT_TOKEN_AQUI
BASE_URL=http://localhost:3000
```
> *(Para obtener un token gratuito, abre Telegram, busca a `@BotFather`, envía `/newbot` y copia el token generado).*

### 3. Iniciar la aplicación
```bash
npm start
```

El script:
1. Iniciará el servidor backend y la base de datos en `http://localhost:3000`.
2. Creará un túnel público HTTPS seguro con Cloudflare (`https://xxxx.trycloudflare.com`).
3. Configurará automáticamente el botón de menú de tu bot en Telegram.

---

## 📖 Guías y Documentación Incluida

* 📄 **[TUTORIAL_MINI_APPS.md](TUTORIAL_MINI_APPS.md)**: Informe completo y didáctico con la teoría, arquitectura, seguridad y guía paso a paso desde cero.
* 🎙️ **[GUION_LOCUCION_ELEVENLABS.md](GUION_LOCUCION_ELEVENLABS.md)**: Guion de locución profesional para vídeos y tutoriales.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Eres libre de usarlo, modificarlo y distribuirlo para tus propios proyectos personales o comerciales.
