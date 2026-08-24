# 🚀 Telegram Mini App (TMA) — DevStudio: Servicios & Reservas

[![Telegram](https://img.shields.io/badge/Telegram-Mini%20App-2CA5E0?logo=telegram&logoColor=white)](https://core.telegram.org/bots/webapps)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Proyecto completo, funcional y de código abierto para crear una **Telegram Mini App (TMA)** profesional desde cero. Desarrollado en colaboración con el asistente de código **Google Antigravity**, este repositorio incluye frontend responsivo adaptado al tema nativo de Telegram, backend en Node.js, validación criptográfica `HMAC-SHA256`, base de datos SQLite y bot automatizado para envío de recibos.

---

## 🌟 Características Destacadas

* **🎨 Frontend Responsivo con Telegram WebApp SDK**:
  - Detección automática del tema de Telegram (soporte dinámico para modo claro y oscuro con variables CSS `--tg-theme-*`).
  - Botón principal flotante nativo de Telegram (`Telegram.WebApp.MainButton`).
  - Botón de navegación nativo (`Telegram.WebApp.BackButton`).
  - Retroalimentación táctil y vibración (`Telegram.WebApp.HapticFeedback`).
  - **🧪 Modo Simulador de Navegador**: Permite probar, depurar e interactuar con toda la app en Chrome, Safari o Firefox (`http://localhost:3000`) sin necesidad de abrir Telegram, incluyendo conmutador de usuarios demo y selector de temas.
* **🔒 Seguridad Criptográfica sin Contraseñas**:
  - Autenticación automática de usuarios validando la firma criptográfica de `initData` con el algoritmo **HMAC-SHA256** en el backend.
* **💾 Persistencia con SQLite**:
  - Base de datos ligera y ultrarrápida (`better-sqlite3`) para almacenar el catálogo de servicios, usuarios y reservas.
* **🤖 Bot de Telegram Integrado**:
  - Respuestas automáticas con botón interactivo al recibir `/start`.
  - Redacción y envío instantáneo de recibos formateados en HTML al chat privado del usuario al confirmar una reserva.
* **🌐 Túnel Seguro HTTPS Automático**:
  - Integración nativa con **Cloudflare Quick Tunnels** (`trycloudflare.com`) para pruebas en tiempo real desde Telegram Web o dispositivos móviles sin pantallas intermedias de bloqueo.

---

## 📁 Estructura del Repositorio

```
telegram_mini_app/
├── client/
│   ├── index.html        # Marcado semántico de la Mini App (Catálogo, Reserva, Historial)
│   ├── style.css         # Estilos CSS adaptados al 100% al tema de Telegram
│   └── app.js            # Lógica de la aplicación, SDK de Telegram y Modo Simulador
├── server/
│   ├── index.js          # Servidor HTTP Express, cabeceras frame-ancestors y API REST
│   ├── auth.js           # Validador criptográfico de initData (HMAC-SHA256)
│   ├── bot.js            # Lógica del Bot de Telegram y generador de recibos HTML
│   ├── db.js             # Capa de datos SQLite (tablas services, users, bookings)
│   └── data/
│       └── services.json # Catálogo semilla inicial de servicios
├── start.js              # Script unificado: Backend + SQLite + Cloudflare Tunnel + Auto-setup de Telegram
├── TUTORIAL_MINI_APPS.md # Guía teórica y técnica exhaustiva desde cero
├── GUION_LOCUCION_ELEVENLABS.md # Guion para vídeo y locución con ElevenLabs
├── package.json          # Dependencias y scripts de ejecución
└── .env.example          # Plantilla de variables de entorno
```

---

## 🤖 Desarrollo Asistido con Google Antigravity

Este proyecto fue desarrollado paso a paso en sesión de programación en parejas (*pair programming*) con **Google Antigravity**. 

### ¿Cómo ayudó Antigravity en el proceso?
1. **Arquitectura y Scaffolding:** Diseñó la estructura limpia y desacoplada separando el frontend web, la API REST y el bot de Telegram.
2. **Implementación de Seguridad (`initData`):** Escribió el algoritmo de verificación criptográfica HMAC-SHA256 según la especificación oficial de Telegram.
3. **Modo Simulador Integrado:** Creó una barra de herramientas dentro del propio navegador para simular el comportamiento del SDK de Telegram en local.
4. **Resolución de Problemas en Vivo:** Diagnosticó y solucionó el error *502 Bad Gateway* / pantalla en blanco que provocaban los túneles antiguos, migrando automáticamente a **Cloudflare Quick Tunnels** y configurando cabeceras `Content-Security-Policy: frame-ancestors`.
5. **Automatización de Menú:** Programó la llamada directa a la Telegram Bot API (`setChatMenuButton`) para que el botón de menú del bot se configure solo al arrancar el servidor.

---

## 🚀 Guía de Instalación y Uso

### Requisitos Previos
* **Node.js** (versión 18 o superior).
* Una cuenta de **Telegram** (puedes usar [web.telegram.org](https://web.telegram.org) en el navegador o la app móvil).

---

### Paso 1: Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/0utKast/telegram_mini_app.git
cd telegram_mini_app
npm install
```

---

### Paso 2: Crear tu Bot en Telegram (@BotFather)

1. Abre Telegram y busca al bot oficial **`@BotFather`** (con tick azul de verificación).
2. Escribe `/start` y luego envía el comando:
   ```text
   /newbot
   ```
3. Asigna un nombre a tu bot (ej: *Mi Mini App Demo*) y un nombre de usuario único que termine en `bot` (ej: *miminiapp_dev_bot*).
4. BotFather te responderá con tu **Token de la API HTTP** (ej: `1234567890:ABCdefGHI...`).

---

### Paso 3: Configurar variables de entorno

Copia el archivo de ejemplo `.env.example` a un nuevo archivo `.env`:

```bash
cp .env.example .env
```

Abre el archivo `.env` y pega tu token:

```env
PORT=3000
TELEGRAM_BOT_TOKEN=PEGA_AQUI_EL_TOKEN_DE_BOTFATHER
BASE_URL=http://localhost:3000
```

---

### Paso 4: Iniciar la aplicación

Ejecuta el script principal:

```bash
npm start
```

El script se encargará automáticamente de:
1. Inicializar la base de datos SQLite y sembrar el catálogo de servicios.
2. Iniciar el servidor Express en el puerto `3000`.
3. Levantar un túnel seguro **HTTPS de Cloudflare** (`https://xxxx.trycloudflare.com`).
4. **Configurar automáticamente el botón de menú de tu bot en Telegram** apuntando a la URL del túnel.

---

### Paso 5: ¡Probar la Mini App!

#### A) En tu navegador habitual (Desarrollo rápido):
Abre tu navegador e ingresa a:
👉 **`http://localhost:3000`**

*Usa la barra superior del **Modo Simulador** para probar temas (claro/oscuro), cambiar de usuario y realizar reservas de prueba.*

#### B) En Telegram (Web o Móvil):
1. Abre el chat con tu bot (`@tu_bot_name`).
2. Pulsa el botón inferior izquierdo **`🚀 Servicios & Reservas`** o escribe `/start`.
3. La Mini App se abrirá dentro de Telegram a pantalla completa.
4. Elige un servicio, selecciona fecha/hora y confirma con el **botón azul flotante nativo de Telegram**.
5. ¡Verás cómo el bot te entrega el recibo de la reserva en el chat inmediatamente!

---

## 📚 Material Educativo Incluido

* 📄 **[TUTORIAL_MINI_APPS.md](TUTORIAL_MINI_APPS.md)**: Informe formativo completo con la teoría, arquitectura, ciclo de vida del SDK y comparativa con apps nativas.
* 🎙️ **[GUION_LOCUCION_ELEVENLABS.md](GUION_LOCUCION_ELEVENLABS.md)**: Guion de voz profesional estructurado con marcas visuales para crear vídeos tutoriales con ElevenLabs.

---

## 📄 Licencia

Este proyecto está distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
