/**
 * Helper para formatear valores en Pesos Chilenos (CLP)
 * Ejemplo: formatCLP(59990) => "$59.990"
 */
export const formatCLP = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `$${Math.round(num).toLocaleString('es-CL')}`;
};

export default formatCLP;
