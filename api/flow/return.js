export default async function handler(req, res) {
  let token = req.query?.token;
  if (!token && req.method === 'POST') {
    token = req.body?.token;
  }

  if (token) {
    return res.redirect(303, `/checkout?status=flow_return&token=${encodeURIComponent(token)}`);
  }

  return res.redirect(302, '/checkout?status=error');
}
