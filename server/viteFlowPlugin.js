import { createFlowPayment, getFlowPaymentStatus, savePendingOrder, getSavedPendingOrder } from './flowService.js';

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [key, val] of params.entries()) {
          obj[key] = val;
        }
        resolve(obj);
      } else {
        // Fallback: intentar URLSearchParams o JSON
        try {
          resolve(JSON.parse(body));
        } catch {
          const params = new URLSearchParams(body);
          const obj = {};
          for (const [key, val] of params.entries()) {
            obj[key] = val;
          }
          resolve(obj);
        }
      }
    });
    req.on('error', err => reject(err));
  });
}

export function flowApiPlugin() {
  return {
    name: 'vite-plugin-flow-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = url.pathname;

        // 1. Crear Orden de Pago en Flow: POST /api/flow/create
        if (pathname === '/api/flow/create' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const clientOrigin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

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

        // 2. Retorno de Flow al comercio: POST /api/flow/return o GET /api/flow/return
        if (pathname === '/api/flow/return') {
          let token = url.searchParams.get('token');
          if (!token && req.method === 'POST') {
            const body = await parseRequestBody(req);
            token = body.token;
          }

          if (token) {
            // Redirigir al cliente de forma limpia hacia la pantalla de checkout con status=flow_return
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

        // 3. Consultar Estado del Pago: GET /api/flow/status?token=...
        if (pathname === '/api/flow/status' && req.method === 'GET') {
          const token = url.searchParams.get('token');
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

        // 4. Webhook de Confirmación Asíncrona: POST /api/flow/confirm
        if (pathname === '/api/flow/confirm' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const token = body.token || url.searchParams.get('token');
            if (token) {
              const statusResult = await getFlowPaymentStatus(token);
              console.log(`🔔 Webhook Flow recibido para token ${token}, estado: ${statusResult.status}`);
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
          } catch (err) {
            console.error('Error procesando webhook Flow:', err.message);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
          }
          return;
        }

        // Dejar pasar otras solicitudes a Vite
        next();
      });
    }
  };
}
