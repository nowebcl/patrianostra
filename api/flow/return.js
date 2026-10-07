export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let token = req.query?.token;
  if (!token && req.method === 'POST') {
    token = req.body?.token;
  }

  if (token) {
    return res.redirect(303, `/checkout?status=flow_return&token=${encodeURIComponent(token)}`);
  }

  return res.redirect(302, '/checkout?status=error');
}
