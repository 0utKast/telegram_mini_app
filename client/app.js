/**
 * DevStudio — Telegram Mini App (TMA)
 * Frontend Client & Telegram WebApp SDK Integration
 */

// Inicialización de Telegram WebApp SDK
const tg = window.Telegram?.WebApp;
const isInsideTelegram = Boolean(tg && tg.initData && tg.initData.length > 0);

// Estado global de la aplicación
const state = {
  user: null,
  initData: '',
  services: [],
  activeCategory: 'Todos',
  selectedService: null,
  bookingType: 'Online (Videollamada)',
  bookingDate: '',
  bookingTime: '11:00',
  activeTab: 'catalog',
  bookings: [],
  isDarkTheme: false
};

// ============================================================================
// 1. INICIALIZACIÓN Y CONFIGURACIÓN DEL ENTORNO
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initTelegramSDK();
  setupEventListeners();
  setDefaultBookingDate();
  await loadServices();
  await loadUserBookings();
});

function initTelegramSDK() {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();

      // Configurar color de cabecera de Telegram si está soportado
      if (tg.setHeaderColor) {
        tg.setHeaderColor('secondary_bg_color');
      }

      // Obtener datos del usuario desde Telegram
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        state.user = tg.initDataUnsafe.user;
        state.initData = tg.initData;
      }
    } catch (e) {
      console.warn('Error al inicializar Telegram SDK:', e);
    }
  }

  // Si estamos fuera de Telegram (desarrollo local en navegador)
  if (!isInsideTelegram) {
    const simBar = document.getElementById('tg-simulator-bar');
    if (simBar) simBar.style.display = 'block';

    // Usuario demo inicial
    state.user = {
      id: 778899,
      first_name: 'Alex',
      username: 'alex_dev',
      photo_url: ''
    };
  }

  renderUserInfo();
}

function renderUserInfo() {
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  if (!nameEl || !avatarEl) return;

  if (state.user) {
    nameEl.textContent = state.user.first_name || state.user.username || 'Usuario';
    const initial = (state.user.first_name || state.user.username || 'U')[0].toUpperCase();
    avatarEl.textContent = initial;
  } else {
    nameEl.textContent = 'Invitado';
    avatarEl.textContent = '👤';
  }
}

function haptic(type = 'impact', style = 'medium') {
  if (!tg || !tg.HapticFeedback) return;
  try {
    if (type === 'impact') tg.HapticFeedback.impactOccurred(style);
    if (type === 'notification') tg.HapticFeedback.notificationOccurred(style);
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
  } catch (e) {
    // Ignorar si el cliente no lo soporta
  }
}

// ============================================================================
// 2. NAVEGACIÓN POR PESTAÑAS Y TELEGRAM MAINBUTTON / BACKBUTTON
// ============================================================================
function switchTab(tabName) {
  haptic('selection');
  state.activeTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `tab-${tabName}`);
  });

  updateTelegramButtons();

  if (tabName === 'orders') {
    loadUserBookings();
  }
}

function updateTelegramButtons() {
  if (!tg) return;

  // Manejo del BackButton nativo
  if (state.activeTab === 'booking' || state.activeTab === 'orders') {
    if (tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => switchTab('catalog'));
    }
  } else {
    if (tg.BackButton) tg.BackButton.hide();
  }

  // Manejo del MainButton nativo
  if (state.activeTab === 'booking' && state.selectedService) {
    if (tg.MainButton) {
      tg.MainButton.setText(`Confirmar Reserva • ${state.selectedService.price.toFixed(2)} €`);
      tg.MainButton.show();
      tg.MainButton.enable();
      tg.MainButton.offClick(submitBooking);
      tg.MainButton.onClick(submitBooking);
    }
    // Ocultar botón fallback si estamos en Telegram
    const fallbackBtn = document.getElementById('fallback-submit-btn');
    if (fallbackBtn && isInsideTelegram) fallbackBtn.style.display = 'none';
  } else {
    if (tg.MainButton) {
      tg.MainButton.hide();
    }
    const fallbackBtn = document.getElementById('fallback-submit-btn');
    if (fallbackBtn) fallbackBtn.style.display = 'block';
  }
}

// ============================================================================
// 3. CARGA Y RENDERIZADO DEL CATÁLOGO DE SERVICIOS
// ============================================================================
async function loadServices() {
  const container = document.getElementById('services-grid');
  try {
    const res = await fetch(`/api/services?category=${encodeURIComponent(state.activeCategory)}`);
    const json = await res.json();
    if (json.ok) {
      state.services = json.data;
      renderServices();
    }
  } catch (err) {
    console.error('Error al cargar servicios:', err);
    if (container) {
      container.innerHTML = '<div class="loading-spinner">Error al conectar con el servidor.</div>';
    }
  }
}

function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = '<div class="loading-spinner">No hay servicios en esta categoría.</div>';
    return;
  }

  container.innerHTML = state.services.map(s => `
    <article class="service-card" data-id="${s.id}">
      <div class="card-top">
        <div class="service-icon">${s.icon || '💼'}</div>
        <div class="service-info">
          <h3 class="service-title">
            ${escapeHtml(s.title)}
            ${s.badge ? `<span class="badge ${s.popular ? 'popular' : ''}">${escapeHtml(s.badge)}</span>` : ''}
          </h3>
          <p class="service-desc">${escapeHtml(s.description)}</p>
        </div>
      </div>
      <div class="card-bottom">
        <div class="price-box">
          <span class="service-price">${s.price.toFixed(2)} €</span>
          <span class="service-duration">⏱️ ${escapeHtml(s.duration)}</span>
        </div>
        <button class="btn-card-action btn-open-detail" data-id="${s.id}">
          Ver Detalles
        </button>
      </div>
    </article>
  `).join('');

  // Eventos de apertura de detalle
  container.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const id = parseInt(card.dataset.id, 10);
      openServiceModal(id);
    });
  });
}

// ============================================================================
// 4. MODAL DE DETALLE Y SELECCIÓN DE SERVICIO
// ============================================================================
let currentModalService = null;

function openServiceModal(serviceId) {
  haptic('impact', 'light');
  const service = state.services.find(s => s.id === serviceId);
  if (!service) return;

  currentModalService = service;
  const modal = document.getElementById('service-modal');
  const content = document.getElementById('modal-service-content');
  const btnSelect = document.getElementById('modal-btn-select');

  const featuresList = (service.features || []).map(f => `
    <li><span>✅</span> <span>${escapeHtml(f)}</span></li>
  `).join('');

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 40px; margin-bottom: 8px;">${service.icon || '💼'}</div>
      <h2 style="font-size: 19px; font-weight: 800; margin-bottom: 4px;">${escapeHtml(service.title)}</h2>
      <span class="service-duration" style="font-size: 13px;">⏱️ Duración estimada: ${escapeHtml(service.duration)}</span>
    </div>
    
    <p style="font-size: 14px; color: var(--hint-color); line-height: 1.6; margin-bottom: 16px;">
      ${escapeHtml(service.description)}
    </p>

    <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Qué incluye este servicio:</h4>
    <ul class="modal-feature-list">
      ${featuresList}
    </ul>

    <div style="background: var(--bg-color); padding: 12px; border-radius: var(--radius-sm); margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; font-weight: 600;">Tarifa Completa</span>
      <span style="font-size: 20px; font-weight: 800; color: var(--button-color);">${service.price.toFixed(2)} €</span>
    </div>
  `;

  btnSelect.textContent = `Reservar por ${service.price.toFixed(2)} €`;
  modal.style.display = 'flex';
}

function closeServiceModal() {
  haptic('selection');
  const modal = document.getElementById('service-modal');
  if (modal) modal.style.display = 'none';
  currentModalService = null;
}

function selectServiceForBooking(service) {
  haptic('impact', 'medium');
  state.selectedService = service;

  // Actualizar UI del servicio seleccionado
  const box = document.getElementById('booking-selected-service');
  const form = document.getElementById('booking-form');
  const badge = document.getElementById('selected-service-badge');

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="font-size: 28px;">${service.icon || '💼'}</span>
        <div>
          <h4 style="font-size: 15px; font-weight: 700;">${escapeHtml(service.title)}</h4>
          <span style="font-size: 12px; color: var(--hint-color);">⏱️ ${escapeHtml(service.duration)}</span>
        </div>
      </div>
      <span style="font-size: 17px; font-weight: 800; color: var(--button-color);">${service.price.toFixed(2)} €</span>
    </div>
  `;

  form.style.display = 'block';
  if (badge) {
    badge.style.display = 'flex';
    badge.textContent = '1';
  }

  // Actualizar precios en el resumen
  document.getElementById('summary-subtotal').textContent = `${service.price.toFixed(2)} €`;
  document.getElementById('summary-total').textContent = `${service.price.toFixed(2)} €`;

  closeServiceModal();
  switchTab('booking');
}

// ============================================================================
// 5. PROCESO DE RESERVA / CHECKOUT & API SUBMIT
// ============================================================================
function setDefaultBookingDate() {
  const dateInput = document.getElementById('booking-date');
  if (!dateInput) return;

  // Fecha mínima = Mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().split('T')[0];
  dateInput.value = iso;
  dateInput.min = iso;
  state.bookingDate = iso;
}

async function submitBooking(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (!state.selectedService) {
    showNotification('Selecciona primero un servicio', 'error');
    return;
  }

  const dateInput = document.getElementById('booking-date');
  const notesInput = document.getElementById('booking-notes');

  const bookingDate = dateInput ? dateInput.value : state.bookingDate;
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!bookingDate) {
    showNotification('Por favor, selecciona una fecha', 'error');
    return;
  }

  // Activar spinner en Telegram MainButton si está activo
  if (tg && tg.MainButton && isInsideTelegram) {
    tg.MainButton.showProgress();
  }

  const payload = {
    initData: state.initData,
    serviceId: state.selectedService.id,
    bookingDate: bookingDate,
    bookingTime: state.bookingTime,
    bookingType: state.bookingType,
    notes: notes,
    devUser: state.user
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (tg && tg.MainButton) {
      tg.MainButton.hideProgress();
    }

    if (json.ok) {
      haptic('notification', 'success');

      if (tg && isInsideTelegram && tg.showAlert) {
        tg.showAlert(`🎉 ¡Reserva #${json.data.id} Confirmada!\n\nHemos enviado el recibo detallado a tu chat de Telegram.`);
      } else {
        alert(`🎉 ¡Reserva #${json.data.id} Confirmada con éxito!\nServicio: ${json.data.serviceTitle}\nFecha: ${json.data.bookingDate} a las ${json.data.bookingTime}`);
      }

      // Limpiar formulario y navegar a mis reservas
      state.selectedService = null;
      document.getElementById('booking-form').style.display = 'none';
      document.getElementById('booking-selected-service').innerHTML = `
        <div class="empty-selection">
          <span class="empty-icon">👈</span>
          <p>Selecciona primero un servicio del catálogo</p>
          <button class="btn-secondary" id="btn-go-to-catalog">Ver Catálogo</button>
        </div>
      `;
      document.getElementById('selected-service-badge').style.display = 'none';
      if (notesInput) notesInput.value = '';

      switchTab('orders');
    } else {
      haptic('notification', 'error');
      alert(`Error al procesar la reserva: ${json.error || 'Inténtalo de nuevo'}`);
    }
  } catch (err) {
    if (tg && tg.MainButton) tg.MainButton.hideProgress();
    haptic('notification', 'error');
    console.error('Error al enviar reserva:', err);
    alert('Error de conexión con el servidor. Verifica que esté activo.');
  }
}

// ============================================================================
// 6. HISTORIAL DE RESERVAS
// ============================================================================
async function loadUserBookings() {
  const listEl = document.getElementById('orders-list');
  if (!listEl) return;

  try {
    const userId = state.user?.id || 1001;
    const res = await fetch(`/api/bookings/my-bookings?userId=${userId}&initData=${encodeURIComponent(state.initData)}`);
    const json = await res.json();

    if (json.ok) {
      state.bookings = json.data;
      renderUserBookings();
    }
  } catch (err) {
    console.error('Error al cargar reservas:', err);
    listEl.innerHTML = '<div class="loading-spinner">No se pudieron cargar las reservas.</div>';
  }
}

function renderUserBookings() {
  const listEl = document.getElementById('orders-list');
  if (!listEl) return;

  if (state.bookings.length === 0) {
    listEl.innerHTML = `
      <div class="empty-selection" style="background: var(--card-bg); border-radius: var(--radius-md); padding: 30px;">
        <span style="font-size: 36px; display: block; margin-bottom: 8px;">📂</span>
        <p style="font-weight: 700; margin-bottom: 4px;">Aún no tienes reservas activas</p>
        <p style="font-size: 13px; color: var(--hint-color); margin-bottom: 14px;">Explora el catálogo y agenda tu primer servicio.</p>
        <button class="btn-secondary" onclick="switchTab('catalog')">Explorar Servicios</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = state.bookings.map(b => `
    <article class="order-item">
      <div class="order-item-header">
        <span class="order-id">#RES-${b.id}</span>
        <span class="order-status-badge">${escapeHtml(b.status)}</span>
      </div>
      <h4 class="order-service-title">${escapeHtml(b.service_title)}</h4>
      <div class="order-details-meta">
        <span>📅 <b>Fecha:</b> ${escapeHtml(b.booking_date)} a las ${escapeHtml(b.booking_time)}</span>
        <span>📍 <b>Modalidad:</b> ${escapeHtml(b.booking_type)}</span>
        <span>💰 <b>Importe:</b> ${b.price.toFixed(2)} €</span>
        ${b.notes ? `<span>📝 <i>"${escapeHtml(b.notes)}"</i></span>` : ''}
      </div>
    </article>
  `).join('');
}

// ============================================================================
// 7. EVENT LISTENERS & CONTROLADORES DE INTERFAZ
// ============================================================================
function setupEventListeners() {
  // Pestañas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Filtros de Categoría
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      haptic('selection');
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeCategory = chip.dataset.category;
      loadServices();
    });
  });

  // Modal
  document.getElementById('modal-close-btn')?.addEventListener('click', closeServiceModal);
  document.getElementById('service-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'service-modal') closeServiceModal();
  });
  document.getElementById('modal-btn-select')?.addEventListener('click', () => {
    if (currentModalService) selectServiceForBooking(currentModalService);
  });

  // Botón "Ver catálogo" desde pantalla vacía
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-go-to-catalog') {
      switchTab('catalog');
    }
  });

  // Modalidad (Segmented Control)
  document.querySelectorAll('#booking-type-selector .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic('selection');
      document.querySelectorAll('#booking-type-selector .segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.bookingType = btn.dataset.type;
    });
  });

  // Franjas Horarias
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      haptic('selection');
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      state.bookingTime = slot.dataset.time;
    });
  });

  // Fecha
  document.getElementById('booking-date')?.addEventListener('change', (e) => {
    state.bookingDate = e.target.value;
  });

  // Formulario Fallback (en navegador)
  document.getElementById('booking-form')?.addEventListener('submit', submitBooking);

  // Botón Refrescar Reservas
  document.getElementById('btn-refresh-orders')?.addEventListener('click', () => {
    haptic('impact', 'light');
    loadUserBookings();
  });

  // Simulador: Cambiar Tema (Claro / Oscuro)
  document.getElementById('sim-toggle-theme')?.addEventListener('click', () => {
    state.isDarkTheme = !state.isDarkTheme;
    document.body.classList.toggle('dark-theme', state.isDarkTheme);
  });

  // Simulador: Cambiar Usuario
  document.getElementById('sim-user-switch')?.addEventListener('click', () => {
    const demoUsers = [
      { id: 778899, first_name: 'Alex', username: 'alex_dev' },
      { id: 112233, first_name: 'Elena', username: 'elena_tech' },
      { id: 445566, first_name: 'Carlos', username: 'carlos_design' }
    ];
    const currentIndex = demoUsers.findIndex(u => u.id === state.user.id);
    const nextUser = demoUsers[(currentIndex + 1) % demoUsers.length];
    state.user = nextUser;
    renderUserInfo();
    loadUserBookings();
  });
}

function showNotification(msg, type = 'info') {
  alert(msg);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
