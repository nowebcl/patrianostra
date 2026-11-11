import crypto from 'crypto';

// In-memory cache for orders created in this session
const pendingOrders = new Map();

/**
 * Normaliza y obtiene las credenciales de Flow de manera segura
 */
export function getFlowConfig() {
  const apiKey = (process.env.FLOW_API_KEY || '').trim();
  const secretKey = (process.env.FLOW_SECRET_KEY || '').trim();
  const apiUrl = (process.env.FLOW_API_URL || 'https://www.flow.cl/api').trim().replace(/\/+$/, '');

  if (!apiKey || !secretKey) {
    throw new Error('Configuración de pasarela Flow incompleta: FLOW_API_KEY o FLOW_SECRET_KEY no configuradas en las variables de entorno.');
  }

  return { apiKey, secretKey, apiUrl };
}

/**
 * Parsea de forma segura cuerpos JSON o x-www-form-urlencoded (objetos, strings o streams)
 */
export async function parseFlowRequestBody(req) {
  const parseRawText = (raw) => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
    const params = new URLSearchParams(trimmed);
    return Object.fromEntries(params.entries());
  };

  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    return parseRawText(req.body.toString('utf8'));
  }
  if (typeof req.body === 'string') {
    return parseRawText(req.body);
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return parseRawText(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

/**
 * Extrae el origen público (protocolo + host) respetando proxies inversos
 */
export function extractRequestOrigin(req) {
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const host = String(rawHost).split(',')[0].trim();
  const rawProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  const proto = rawProto || (/^(localhost|127\.0\.0\.1)(:|$)/i.test(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Valida la orden y previene manipulación del monto respecto a los ítems enviados
 */
export function validateFlowOrderPayload({ commerceOrder, amount, orderDetails }) {
  if (!commerceOrder || typeof commerceOrder !== 'string') {
    return { valid: false, error: 'Número de orden de comercio requerido' };
  }

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount < 350) {
    return { valid: false, error: 'Monto de orden inválido (mínimo $350 CLP)' };
  }

  if (orderDetails && Array.isArray(orderDetails.items) && orderDetails.items.length > 0) {
    const calculatedSubtotal = orderDetails.items.reduce((sum, item) => {
      const itemPrice = Number(item.product?.price || item.price || 0);
      const itemQty = Math.max(1, Math.round(Number(item.quantity) || 1));
      return sum + (itemPrice * itemQty);
    }, 0);

    const discount = Math.max(0, Number(orderDetails.discountAmount || 0));
    const expectedTotal = Math.max(350, calculatedSubtotal - discount);

    if (numAmount < expectedTotal) {
      console.warn(`[SECURITY ALERT] Intento de manipulación de precios detectado. Esperado: $${expectedTotal}, Recibido: $${numAmount}`);
      return {
        valid: false,
        error: 'Inconsistencia de precios detectada en la orden. Por favor vuelve a cargar el carrito.'
      };
    }
  }

  return { valid: true, numAmount };
}

/**
 * Valida y normaliza el correo para cumplir con la validación estricta de dominios de Flow
 */
export function sanitizeFlowEmail(email) {
  if (!email || typeof email !== 'string') return 'cliente@patrianostradistro.cl';
  const clean = email.trim().toLowerCase();
  // Flow rechaza dominios de prueba como ejemplo.cl o test.cl
  if (
    clean.includes('@ejemplo.') ||
    clean.includes('@test.') ||
    clean.includes('@example.') ||
    !clean.includes('@') ||
    clean.length < 5
  ) {
    return 'cliente@patrianostradistro.cl';
  }
  return clean;
}

/**
 * Genera la firma HMAC-SHA256 según especificación oficial de Flow
 * 1. Ordena alfabéticamente los nombres de los parámetros
 * 2. Concatena clave + valor
 * 3. Aplica HMAC-SHA256 con secretKey
 */
export function signFlowParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

/**
 * Inicia una orden de pago en Flow
 */
export async function createFlowPayment({
  commerceOrder,
  subject,
  amount,
  email,
  clientOrigin,
  orderDetails = null
}) {
  const { apiKey, secretKey, apiUrl } = getFlowConfig();

  // El monto mínimo que Flow permite en CLP es 350
  const cleanAmount = Math.max(350, Math.round(Number(amount) || 350));
  const baseUrl = clientOrigin || 'http://localhost:3000';
  const cleanEmail = sanitizeFlowEmail(email);

  const params = {
    apiKey,
    commerceOrder: String(commerceOrder || `PN-${Date.now()}`),
    subject: subject ? String(subject).slice(0, 100) : `Orden ${commerceOrder}`,
    currency: 'CLP',
    amount: cleanAmount,
    email: cleanEmail,
    urlConfirmation: `${baseUrl}/api/flow/confirm`,
    urlReturn: `${baseUrl}/api/flow/return`
  };

  const s = signFlowParams(params, secretKey);
  const body = new URLSearchParams({ ...params, s }).toString();

  const response = await fetch(`${apiUrl}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Respuesta inválida de Flow (${response.status}): ${text}`);
  }

  if (!response.ok || !data.token) {
    const errorMsg = data.message || `Error al crear pago en Flow (código ${data.code || response.status})`;
    console.error('❌ Error Flow API:', data);
    throw new Error(errorMsg);
  }

  // Guardar en caché el pedido asociado a este token para recuperarlo en el retorno
  if (orderDetails) {
    pendingOrders.set(data.token, {
      ...orderDetails,
      flowToken: data.token,
      flowOrder: data.flowOrder,
      createdAt: Date.now()
    });
  }

  const separator = String(data.url).includes('?') ? '&' : '?';

  return {
    token: data.token,
    url: data.url,
    flowOrder: data.flowOrder,
    redirectUrl: `${data.url}${separator}token=${data.token}`
  };
}

/**
 * Consulta el estado de una orden en Flow mediante getStatus
 */
export async function getFlowPaymentStatus(token) {
  const { apiKey, secretKey, apiUrl } = getFlowConfig();

  if (!token) {
    throw new Error('Token de Flow no proporcionado');
  }

  const params = {
    apiKey,
    token: String(token)
  };

  const s = signFlowParams(params, secretKey);
  const query = new URLSearchParams({ ...params, s }).toString();

  const response = await fetch(`${apiUrl}/payment/getStatus?${query}`, {
    method: 'GET'
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Respuesta inválida de Flow getStatus (${response.status}): ${text}`);
  }

  if (!response.ok) {
    throw new Error(data.message || `Error consultando estado en Flow (código ${data.code || response.status})`);
  }

  const savedOrder = pendingOrders.get(token) || null;

  return {
    flowData: data,
    status: data.status, // 1: pendiente, 2: pagada, 3: rechazada, 4: anulada
    isPaid: data.status === 2,
    savedOrder
  };
}

/**
 * Guarda o actualiza los datos de un pedido asociado a un token
 */
export function savePendingOrder(token, order) {
  pendingOrders.set(token, {
    ...order,
    savedAt: Date.now()
  });
}

/**
 * Obtiene los datos de un pedido asociado a un token
 */
export function getSavedPendingOrder(token) {
  return pendingOrders.get(token) || null;
}
