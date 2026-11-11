import {
  createFlowPayment,
  extractRequestOrigin,
  parseFlowRequestBody,
  validateFlowOrderPayload
} from '../../server/flowService.js';

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
    const origin = extractRequestOrigin(req);
    const body = await parseFlowRequestBody(req);
    const { commerceOrder, subject, amount, email, orderDetails } = body;

    const validation = validateFlowOrderPayload({ commerceOrder, amount, orderDetails });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const result = await createFlowPayment({
      commerceOrder,
      subject,
      amount: validation.numAmount,
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
