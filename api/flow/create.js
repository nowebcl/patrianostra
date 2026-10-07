import { createFlowPayment } from '../../server/flowService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const origin = req.headers['x-forwarded-proto']
      ? `${req.headers['x-forwarded-proto']}://${req.headers.host}`
      : `http://${req.headers.host}`;

    const { commerceOrder, subject, amount, email, orderDetails } = req.body;

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
