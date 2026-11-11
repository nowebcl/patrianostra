import { getFlowPaymentStatus, parseFlowRequestBody } from '../../server/flowService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const body = req.method === 'POST' ? await parseFlowRequestBody(req) : {};
    const token = body?.token || body?.TOKEN || req.query?.token;
    if (token) {
      await getFlowPaymentStatus(token);
    }
  } catch (err) {
    console.error('Flow confirmation webhook error:', err);
  }
  return res.status(200).send('OK');
}
