import crypto from 'crypto';

// In-memory cache for orders created in this session
const pendingOrders = new Map();

/**
 * Normaliza y obtiene las credenciales de Flow de manera segura
 */
export function getFlowConfig() {
  const apiKey = process.env.FLOW_API_KEY || '28F1BB16-B8A8-4A36-95D9-92643BE31L7E';
  const secretKey = process.env.FLOW_SECRET_KEY || 'f5aca74d33356b5c158c0a893ecd0b2c9f877838';
  const apiUrl = process.env.FLOW_API_URL || 'https://www.flow.cl/api';

  return { apiKey, secretKey, apiUrl };
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

  const params = {
    apiKey,
    commerceOrder: String(commerceOrder),
    subject: subject ? String(subject).slice(0, 100) : `Orden ${commerceOrder}`,
    currency: 'CLP',
    amount: cleanAmount,
    email: email || 'cliente@patrianostradistro.cl',
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
    throw new Error(data.message || `Error al crear pago en Flow (código ${data.code || response.status})`);
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

  return {
    token: data.token,
    url: data.url,
    flowOrder: data.flowOrder,
    redirectUrl: `${data.url}?token=${data.token}`
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
