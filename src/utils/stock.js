export const LOW_STOCK_THRESHOLD = 4;

/**
 * Obtiene la cantidad de stock disponible para una talla específica de un producto.
 * Uso interno para validaciones de carrito y cálculo de estado (no mostrar al comprador).
 */
export function getSizeStock(product, size) {
  if (!product) return 0;
  const sizeStock = product.sizeStock || {};
  if (size && sizeStock[size] !== undefined) {
    return Math.max(0, Number(sizeStock[size]) || 0);
  }
  if (product.stock !== undefined) {
    return Math.max(0, Number(product.stock) || 0);
  }
  return 0;
}

/**
 * Devuelve el estado de stock visible para el comprador sin exponer cantidades exactas:
 * - 0 o menos: "No hay stock"
 * - Menos de 4 (1, 2 o 3): "Pocas unidades"
 * - 4 o más: disponible sin etiqueta de cantidad
 */
export function getStockStatus(stockQty) {
  const qty = Number(stockQty) || 0;
  if (qty <= 0) {
    return {
      status: 'out',
      isOutOfStock: true,
      isLowStock: false,
      label: 'No hay stock'
    };
  }
  if (qty < LOW_STOCK_THRESHOLD) {
    return {
      status: 'low',
      isOutOfStock: false,
      isLowStock: true,
      label: 'Pocas unidades'
    };
  }
  return {
    status: 'available',
    isOutOfStock: false,
    isLowStock: false,
    label: null
  };
}
