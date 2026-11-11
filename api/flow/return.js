import { parseFlowRequestBody } from '../../server/flowService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let token = req.query?.token || req.query?.TOKEN;
  if (!token && req.method === 'POST') {
    const body = await parseFlowRequestBody(req);
    token = body?.token || body?.TOKEN;
  }

  if (token) {
    return res.redirect(303, `/checkout?status=flow_return&token=${encodeURIComponent(String(token))}`);
  }

  return res.redirect(303, '/checkout?status=error');
}
