import { createFlowPayment, getFlowPaymentStatus, savePendingOrder, getSavedPendingOrder } from './flowService.js';

async function parseRequestBody(req) {
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    if (!body) return {};

    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      return JSON.parse(body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      const obj = {};
      for (const [key, val] of params.entries()) {
        obj[key] = val;
      }
      return obj;
    } else {
      try {
        return JSON.parse(body);
      } catch {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [key, val] of params.entries()) {
          obj[key] = val;
        }
        return obj;
      }
    }
  } catch (e) {
    console.error('Error parsing request body:', e);
    return {};
  }
}

export function flowApiPlugin() {
  return {
    name: 'vite-plugin-flow-api',
    configureServer(server) {
      // Registrar antes de los middlewares estáticos de Vite
      server.middlewares.use(async (req, res, next) => {
        // Habilitar CORS para todas las llamadas API
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Manejar preflight OPTIONS
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const rawUrl = req.url || '';
        const urlObj = new URL(rawUrl, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = urlObj.pathname.replace(/\/$/, ''); // Remover trailing slash

        // Solo procesar rutas que inicien con /api/flow
        if (!pathname.startsWith('/api/flow')) {
          return next();
        }

        // 1. Crear Orden de Pago en Flow: POST /api/flow/create
        if (pathname === '/api/flow/create' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const clientOrigin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host || 'localhost:3000'}`;

            const result = await createFlowPayment({
              commerceOrder: body.commerceOrder,
              subject: body.subject,
              amount: body.amount,
              email: body.email,
              clientOrigin,
              orderDetails: body.orderDetails
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, ...result }));
          } catch (error) {
            console.error('❌ Error creando pago en Flow:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
          return;
        }

        // 2. Retorno de Flow: POST /api/flow/return o GET /api/flow/return
        if (pathname === '/api/flow/return') {
          let token = urlObj.searchParams.get('token');
          if (!token && req.method === 'POST') {
            const body = await parseRequestBody(req);
            token = body.token;
          }

          if (token) {
            res.writeHead(303, {
              Location: `/checkout?status=flow_return&token=${encodeURIComponent(token)}`
            });
            res.end();
          } else {
            res.writeHead(302, { Location: '/checkout?status=error' });
            res.end();
          }
          return;
        }

        // 3. Consultar Estado: GET /api/flow/status?token=...
        if (pathname === '/api/flow/status' && req.method === 'GET') {
          const token = urlObj.searchParams.get('token');
          if (!token) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Token no especificado' }));
            return;
          }

          try {
            const statusResult = await getFlowPaymentStatus(token);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, ...statusResult }));
          } catch (error) {
            console.error('❌ Error consultando estado Flow:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
          return;
        }

        // 4. Webhook: POST /api/flow/confirm
        if (pathname === '/api/flow/confirm' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const token = body.token || urlObj.searchParams.get('token');
            if (token) {
              await getFlowPaymentStatus(token);
            }
          } catch (err) {
            console.error('Error en webhook Flow:', err.message);
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OK');
          return;
        }

        next();
      });
    }
  };
}
