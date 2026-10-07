/**
 * Servicio Oficial de Pagos Flow (Webpay Plus, Tarjetas, Servipag, Mach)
 * Patria Nostra Distro
 * 
 * Gestiona la conexión segura con Flow a través de nuestros endpoints
 * de backend para proteger el Secret Key y firmar transacciones con HMAC-SHA256.
 */

/**
 * Inicia una transacción en Flow
 * 
 * @param {Object} params
 * @param {string} params.commerceOrder - Número de orden único (ej. PN-CL-123456)
 * @param {string} params.subject - Descripción de la compra
 * @param {number} params.amount - Monto total en CLP (Mínimo $350 CLP)
 * @param {string} params.email - Email del pagador
 * @param {Object} params.orderDetails - Objeto con datos completos del pedido para persistencia
 * @returns {Promise<{ redirectUrl: string, token: string, flowOrder: number, isLive: boolean }>}
 */
export const initFlowPayment = async ({
  commerceOrder,
  subject,
  amount,
  email,
  orderDetails = null
}) => {
  try {
    const response = await fetch('/api/flow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        commerceOrder,
        subject: subject || `Orden Patria Nostra ${commerceOrder}`,
        amount: Math.round(amount),
        email,
        orderDetails
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al comunicar con la pasarela Flow');
    }

    return {
      redirectUrl: data.redirectUrl,
      token: data.token,
      flowOrder: data.flowOrder,
      isLive: true
    };
  } catch (error) {
    console.error('Error iniciando pago con Flow:', error);
    throw error;
  }
};

/**
 * Consulta el estado verificado de una transacción en Flow
 * 
 * @param {string} token - Token de la transacción entregado por Flow
 * @returns {Promise<{ status: number, isPaid: boolean, flowData: Object, savedOrder: Object|null }>}
 */
export const checkFlowPaymentStatus = async (token) => {
  try {
    const response = await fetch(`/api/flow/status?token=${encodeURIComponent(token)}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'No se pudo verificar el estado del pago');
    }

    return {
      status: data.status, // 1: pendiente, 2: pagada, 3: rechazada, 4: anulada
      isPaid: data.isPaid || data.status === 2,
      flowData: data.flowData,
      savedOrder: data.savedOrder
    };
  } catch (error) {
    console.error('Error consultando estado Flow:', error);
    throw error;
  }
};

/**
 * Redirige al cliente a la pasarela segura de Flow
 */
export const redirectToFlow = (redirectUrl) => {
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
};

/**
 * Compatibilidad con llamados anteriores de Webpay
 */
export const initWebpayTransaction = async ({ buyOrder, amount, email, orderDetails }) => {
  const res = await initFlowPayment({
    commerceOrder: buyOrder,
    subject: `Orden Patria Nostra ${buyOrder}`,
    amount,
    email,
    orderDetails
  });
  return {
    url: res.redirectUrl,
    token: res.token,
    isLive: true
  };
};

export const redirectToWebpayForm = (url) => {
  if (url) {
    window.location.href = url;
  }
};
