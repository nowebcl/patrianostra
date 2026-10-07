import { getFlowPaymentStatus } from '../../server/flowService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const token = req.query?.token;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token no especificado' });
  }

  try {
    const result = await getFlowPaymentStatus(token);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
