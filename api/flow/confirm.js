import { getFlowPaymentStatus } from '../../server/flowService.js';

export default async function handler(req, res) {
  try {
    const token = req.body?.token || req.query?.token;
    if (token) {
      await getFlowPaymentStatus(token);
    }
  } catch (err) {
    console.error('Flow confirmation webhook error:', err);
  }
  return res.status(200).send('OK');
}
