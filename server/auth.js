import crypto from 'crypto';

/**
 * Valida la firma criptográfica de initData enviada por Telegram WebApp.
 * @param {string} initData - Cadena de consulta enviada por Telegram WebApp
 * @param {string} botToken - Token del bot configurado en variables de entorno
 * @returns {{ validated: boolean, user: object | null, authDate: number | null }}
 */
export function validateTelegramInitData(initData, botToken = process.env.TELEGRAM_BOT_TOKEN) {
  if (!initData) {
    return { validated: false, user: null, authDate: null, error: 'No initData provided' };
  }

  // Si no hay botToken configurado aún (modo desarrollo inicial), permitir mock user si viene con bandera dev
  if (!botToken || botToken === 'TU_BOT_TOKEN_AQUI') {
    try {
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      const user = userStr ? JSON.parse(userStr) : { id: 999999, first_name: 'Usuario', username: 'dev_user' };
      return { validated: true, user, isDevMode: true };
    } catch (e) {
      return { validated: false, user: null, error: 'Invalid initData format in dev mode' };
    }
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return { validated: false, user: null, error: 'Missing hash in initData' };
    }

    urlParams.delete('hash');

    // 1. Ordenar claves alfabéticamente
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckArr = keys.map((key) => `${key}=${urlParams.get(key)}`);
    const dataCheckString = dataCheckArr.join('\n');

    // 2. Secret key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // 3. Hash calculado = HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // 4. Comparación de tiempo constante (segura contra timing attacks)
    const hashBuffer = Buffer.from(hash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

    if (hashBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(hashBuffer, calculatedBuffer)) {
      return { validated: false, user: null, error: 'Hash mismatch: untrusted initData' };
    }

    const userRaw = urlParams.get('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);

    return { validated: true, user, authDate, isDevMode: false };
  } catch (err) {
    return { validated: false, user: null, error: err.message };
  }
}
