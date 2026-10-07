import { jsPDF } from 'jspdf';
import { formatCLP } from './currency.js';

/**
 * Genera y descarga automáticamente el comprobante oficial en PDF
 * de la orden de compra en Patria Nostra.
 * 
 * Cumple con incluir:
 * - Nº de orden, fecha y estado de pago Flow
 * - Datos del cliente y dirección de entrega
 * - Detalle de prendas, tallas y totales
 * - Correo oficial exclusivo para coordinación y seguimiento:
 *   contacto@patrianostradistro.cl
 */
export function generateOrderPdf(order, { autoDownload = true } = {}) {
  if (!order) return null;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Paleta de colores oficial Patria Nostra
  const crimson = [197, 34, 34];
  const dark = [17, 17, 17];
  const muted = [90, 90, 90];
  const lightBg = [248, 248, 248];
  const borderCol = [220, 220, 220];

  // 1. Barra superior carmesí
  doc.setFillColor(...crimson);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Encabezado de Marca
  let y = 18;
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PATRIA NOSTRA', margin, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...crimson);
  doc.text('DISTRO OFICIAL • CHILE 🇨🇱', margin, y + 5);

  // Número de orden a la derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text('ORDEN DE COMPRA', pageWidth - margin, y - 2, { align: 'right' });
  doc.setFontSize(14);
  doc.setTextColor(...crimson);
  doc.text(String(order.orderNumber || 'PN-CL-000000'), pageWidth - margin, y + 4, { align: 'right' });

  // Fecha y estado
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  const orderDate = order.date || new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${orderDate}`, pageWidth - margin, y + 9, { align: 'right' });

  // Línea divisoria
  y = 32;
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Estado de la Transacción / Pasarela Flow
  y = 38;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
  doc.setDrawColor(210, 210, 210);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...dark);
  doc.text('ESTADO DEL PAGO:', margin + 4, y + 6);
  doc.setTextColor(34, 139, 34); // Forest Green
  doc.text('PAGADO & APROBADO (FLOW / WEBPAY PLUS)', margin + 42, y + 6);

  const flowId = order.paymentDetails?.flowOrder || order.flowOrder || 'Completado';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`Pasarela: Flow Chile  |  ID / Folio Flow: ${flowId}`, margin + 4, y + 11.5);

  // 4. Datos del Cliente & Despacho
  y = 60;
  const colW = (contentWidth - 6) / 2;

  // Box Izquierdo: Datos del Cliente
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderCol);
  doc.roundedRect(margin, y, colW, 36, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...crimson);
  doc.text('DATOS DEL DESTINATARIO', margin + 4, y + 6);

  const cust = order.customer || {};
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...dark);
  doc.text(`${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Cliente Patria Nostra', margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`RUT / Identificación: ${cust.rut || 'No indicado'}`, margin + 4, y + 17);
  doc.text(`Teléfono: ${cust.phone || 'No indicado'}`, margin + 4, y + 22);
  doc.text(`Email de compra: ${cust.email || 'No indicado'}`, margin + 4, y + 27);

  // Box Derecho: Dirección de Envío
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin + colW + 6, y, colW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderCol);
  doc.roundedRect(margin + colW + 6, y, colW, 36, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...crimson);
  doc.text('DIRECCIÓN DE ENTREGA 🇨🇱', margin + colW + 10, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...dark);
  doc.text(cust.address || 'Dirección no indicada', margin + colW + 10, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`${cust.city || ''}, ${cust.region || ''}`, margin + colW + 10, y + 17);
  doc.text(`Código Postal: ${cust.postalCode || '7500000'}`, margin + colW + 10, y + 22);
  doc.text(`Despacho: Despacho a coordinar`, margin + colW + 10, y + 27);

  // 5. Tabla de Productos Comprados
  y = 104;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...dark);
  doc.text('DETALLE DE PRENDAS Y PRODUCTOS', margin, y);

  y = 108;
  // Encabezado de tabla
  doc.setFillColor(...dark);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCTO', margin + 3, y + 4.8);
  doc.text('TALLA', margin + 95, y + 4.8);
  doc.text('CANT.', margin + 120, y + 4.8, { align: 'center' });
  doc.text('UNITARIO', margin + 145, y + 4.8, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 3, y + 4.8, { align: 'right' });

  y += 7;
  const items = Array.isArray(order.items) ? order.items : [];
  let isEven = false;

  items.forEach(item => {
    const pName = item.product?.name || item.name || 'Prenda Patria Nostra';
    const pSize = item.size || 'Única';
    const pQty = Number(item.quantity) || 1;
    const pPrice = Number(item.product?.price || item.price || 0);
    const pTotal = pPrice * pQty;

    // Fila zebra
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    isEven = !isEven;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    
    // Cortar nombre si es muy largo
    const truncatedName = pName.length > 48 ? pName.slice(0, 45) + '...' : pName;
    doc.text(truncatedName, margin + 3, y + 5.2);
    doc.text(pSize, margin + 95, y + 5.2);
    doc.text(String(pQty), margin + 120, y + 5.2, { align: 'center' });
    doc.text(formatCLP(pPrice), margin + 145, y + 5.2, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCLP(pTotal), pageWidth - margin - 3, y + 5.2, { align: 'right' });

    y += 8;
  });

  // Línea inferior de la tabla
  doc.setDrawColor(...borderCol);
  doc.line(margin, y, pageWidth - margin, y);

  // 6. Resumen Financiero a la derecha
  y += 4;
  const sumW = 75;
  const sumX = pageWidth - margin - sumW;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);

  doc.text('Subtotal:', sumX, y + 4);
  doc.text(formatCLP(order.subtotal || order.finalTotal), pageWidth - margin - 2, y + 4, { align: 'right' });

  if (order.discountAmount && order.discountAmount > 0) {
    y += 5;
    doc.setTextColor(...crimson);
    doc.text('Descuento aplicado:', sumX, y + 4);
    doc.text(`-${formatCLP(order.discountAmount)}`, pageWidth - margin - 2, y + 4, { align: 'right' });
    doc.setTextColor(...muted);
  }

  y += 5;
  doc.text('Despacho:', sumX, y + 4);
  doc.text('A coordinar', pageWidth - margin - 2, y + 4, { align: 'right' });

  y += 6;
  doc.setFillColor(...crimson);
  doc.rect(sumX - 2, y, sumW + 2, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAGADO:', sumX + 2, y + 5.5);
  doc.text(formatCLP(order.finalTotal || 0), pageWidth - margin - 2, y + 5.5, { align: 'right' });

  // 7. SECCIÓN OFICIAL DE SEGUIMIENTO Y COORDINACIÓN (con el correo solicitado)
  y += 18;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(...crimson);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...crimson);
  doc.text('📦 COORDINAR ENVÍO A DIRECCIÓN...', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...dark);
  doc.text('¡GRACIAS! Para coordinar el envío te enviaremos un correo, o escríbenos a:', margin + 6, y + 14);

  // Email destacado exclusivamente para seguimiento pos-compra
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 6, y + 21, contentWidth - 12, 9, 1, 1, 'F');
  doc.setDrawColor(...borderCol);
  doc.roundedRect(margin + 6, y + 21, contentWidth - 12, 9, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...crimson);
  doc.text('contacto@patrianostradistro.cl', margin + 10, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text(`(Indica tu Nº de Orden ${order.orderNumber} en el asunto para atención prioritaria)`, pageWidth - margin - 10, y + 27, { align: 'right' });

  // 8. Pie de página
  const footY = pageHeight - 12;
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.3);
  doc.line(margin, footY - 4, pageWidth - margin, footY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text('PATRIA NOSTRA DISTRO • Identidad, lealtad y resistencia textil • Hecho en Chile', margin, footY);
  doc.text(`Documento generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - margin, footY, { align: 'right' });

  // Descarga automática
  if (autoDownload) {
    const filename = `Orden_${order.orderNumber || 'PatriaNostra'}.pdf`;
    doc.save(filename);
  }

  return doc;
}
