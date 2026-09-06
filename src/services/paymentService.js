/**
 * Servicio de Pagos Webpay Plus (Transbank) - Patria Nostra
 * 
 * Este módulo gestiona el flujo de pagos. Cuando tengas lista tu API backend 
 * (ej. Node/Express, serverless o PocketBase hook), sólo debes configurar 
 * la variable VITE_WEBPAY_API_URL en tu archivo .env
 */

const WEBPAY_API_URL = import.meta.env.VITE_WEBPAY_API_URL || '';

/**
 * Verifica si la API de Webpay ya está conectada al backend
 */
export const isWebpayApiConfigured = () => {
  return Boolean(WEBPAY_API_URL && WEBPAY_API_URL.trim().length > 0);
};

/**
 * Inicia una transacción en Webpay Plus
 * 
 * @param {Object} orderData
 * @param {string} orderData.buyOrder - Número de orden único (ej. PN-CL-123456)
 * @param {string} orderData.sessionId - ID de sesión del cliente
 * @param {number} orderData.amount - Monto total en CLP
 * @param {string} orderData.returnUrl - URL a la que Transbank retornará tras pagar
 * @returns {Promise<{ url: string, token: string, isLive: boolean }>}
 */
export const initWebpayTransaction = async ({ buyOrder, sessionId, amount, returnUrl }) => {
  // 1. Si tu API backend ya está configurada, enviamos la petición real
  if (isWebpayApiConfigured()) {
    try {
      const response = await fetch(`${WEBPAY_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buyOrder,
          sessionId: sessionId || `sess_${Date.now()}`,
          amount: Math.round(amount),
          returnUrl: returnUrl || `${window.location.origin}/checkout?status=webpay_return`
        })
      });

      if (!response.ok) {
        throw new Error(`Error en API Webpay (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      return {
        url: data.url,
        token: data.token,
        isLive: true
      };
    } catch (error) {
      console.error('Fallo al conectar con la API de Webpay:', error);
      throw error;
    }
  }

  // 2. Modo Preparatorio (hasta que proporciones tu API de Webpay)
  console.info('ℹ️ Modo Webpay en espera de API backend. Simulando transacción exitosa para pruebas...');
  
  // Simulamos una demora de red realista
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    url: null, // Sin redirección externa en modo prueba
    token: `sim_token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    isLive: false,
    mockDetails: {
      authorizationCode: '128941',
      responseCode: 0,
      paymentTypeCode: 'VD', // Venta Débito
      sharesNumber: 0
    }
  };
};

/**
 * Confirma una transacción que retorna de Webpay Plus (Transbank)
 * 
 * @param {string} token - Token retornado por Transbank (token_ws)
 * @returns {Promise<Object>}
 */
export const commitWebpayTransaction = async (token) => {
  if (isWebpayApiConfigured()) {
    try {
      const response = await fetch(`${WEBPAY_API_URL}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token_ws: token })
      });

      if (!response.ok) {
        throw new Error(`Error al confirmar Webpay (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al confirmar transacción Webpay:', error);
      throw error;
    }
  }

  return {
    status: 'AUTHORIZED',
    responseCode: 0,
    authorizationCode: '128941',
    amount: null,
    buyOrder: null
  };
};

/**
 * Redirige al usuario al formulario oficial de Webpay Plus de Transbank
 * mediante un formulario POST automático con token_ws
 */
export const redirectToWebpayForm = (url, token) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token_ws';
  tokenInput.value = token;

  form.appendChild(tokenInput);
  document.body.appendChild(form);
  form.submit();
};
