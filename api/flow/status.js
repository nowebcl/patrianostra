import { getFlowPaymentStatus } from '../../server/flowService.js';

export default async function handler(req, res) {
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
