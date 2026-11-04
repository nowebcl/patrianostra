import { createFlowPayment } from '../../server/flowService.js';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch {}
  }
  try {
    let str = '';
    for await (const chunk of req) {
      str += chunk;
    }
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      const params = new URLSearchParams(str);
      return Object.fromEntries(params.entries());
    }
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const origin = req.headers['x-forwarded-proto']
      ? `${req.headers['x-forwarded-proto']}://${req.headers.host}`
      : `http://${req.headers.host}`;

    const body = await parseBody(req);
    const { commerceOrder, subject, amount, email, orderDetails } = body;

    // Validación defensiva de orden y correo
    if (!commerceOrder || typeof commerceOrder !== 'string') {
      return res.status(400).json({ success: false, error: 'Número de orden de comercio requerido' });
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 350) {
      return res.status(400).json({ success: false, error: 'Monto de orden inválido (mínimo $350 CLP)' });
    }

    // Validación defensiva anti-Price Tampering si vienen los ítems de la orden
    if (orderDetails && Array.isArray(orderDetails.items) && orderDetails.items.length > 0) {
      const calculatedSubtotal = orderDetails.items.reduce((sum, item) => {
        const itemPrice = Number(item.product?.price || item.price || 0);
        const itemQty = Math.max(1, Math.round(Number(item.quantity) || 1));
        return sum + (itemPrice * itemQty);
      }, 0);

      const discount = Number(orderDetails.discountAmount || 0);
      const expectedTotal = Math.max(350, calculatedSubtotal - discount);

      // Si el monto enviado por el cliente es inferior al total calculado real
      if (numAmount < expectedTotal) {
        console.warn(`[SECURITY ALERT] Intento de manipulación de precios detectado. Esperado: $${expectedTotal}, Recibido: $${numAmount}`);
        return res.status(400).json({
          success: false,
          error: 'Inconsistencia de precios detectada en la orden. Por favor vuelve a cargar el carrito.'
        });
      }
    }

    const result = await createFlowPayment({
      commerceOrder,
      subject,
      amount: numAmount,
      email,
      clientOrigin: origin,
      orderDetails
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error Flow create:', error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
}
