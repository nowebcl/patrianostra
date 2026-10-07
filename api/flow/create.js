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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
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

    const result = await createFlowPayment({
      commerceOrder,
      subject,
      amount,
      email,
      clientOrigin: origin,
      orderDetails
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error Flow create:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
}
