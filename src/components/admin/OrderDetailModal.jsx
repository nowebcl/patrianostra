import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Truck, 
  CreditCard, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Package, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const STATUS_COLORS = {
  'Pendiente': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'En Preparación': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Enviado': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Entregado': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Cancelado': 'bg-red-500/20 text-red-300 border-red-500/40'
};

export const OrderDetailModal = ({ order, isOpen, onClose }) => {
  const { updateOrderStatus } = useStore();
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pendiente');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSaveChanges = () => {
    updateOrderStatus(order.orderNumber, selectedStatus, trackingNumber.trim() || null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0b0b] border border-neutral-800 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-[#0e0e0e] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#151515] border border-neutral-800 flex items-center justify-center text-[#C52222]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#C52222] font-condensed font-bold text-xs tracking-[0.25em] uppercase block">
                DETALLE DE ORDEN OFICIAL
              </span>
              <h2 className="font-condensed text-xl sm:text-2xl font-bold uppercase tracking-wider text-white font-mono">
                {order.orderNumber}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-neutral-300 hover:text-white bg-[#151515] hover:bg-neutral-800 border border-neutral-800 rounded flex items-center gap-1.5 text-xs font-condensed font-bold uppercase cursor-pointer"
              title="Imprimir comprobante"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">IMPRIMIR</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs font-sans">
          
          {/* Status & Quick Action Banner */}
          <div className="bg-[#121212] border border-neutral-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <span className="font-condensed font-bold uppercase tracking-wider text-neutral-400">ESTADO ACTUAL:</span>
              <span className={`px-3 py-1 text-xs font-condensed font-bold uppercase rounded border ${STATUS_COLORS[order.status] || 'bg-neutral-800 text-white'}`}>
                {order.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="font-condensed text-neutral-400 uppercase">CAMBIAR A:</label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="bg-black border border-neutral-700 text-white text-xs font-condensed font-bold uppercase p-2 rounded focus:border-[#C52222] focus:outline-none cursor-pointer"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Preparación">En Preparación</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold uppercase rounded text-xs transition-colors cursor-pointer"
              >
                {isSaved ? '¡ACTUALIZADO!' : 'ACTUALIZAR ESTADO'}
              </button>
            </div>
          </div>

          {/* Tracking Number Input */}
          <div className="bg-black/60 border border-neutral-900 p-4 rounded print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-neutral-300 font-condensed font-bold uppercase">
                <Truck className="w-4 h-4 text-[#C52222]" />
                <span>NÚMERO DE SEGUIMIENTO (CHILEXPRESS / STARKEN):</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej: CHX-948210-CL"
                  className="flex-1 bg-[#111] border border-neutral-800 rounded p-2 text-white font-mono focus:outline-none focus:border-[#C52222]"
                />
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-3 py-2 bg-[#181818] hover:bg-neutral-800 border border-neutral-700 text-white font-condensed uppercase font-bold rounded"
                >
                  GUARDAR NÚMERO
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Customer & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Info */}
            <div className="bg-black/60 border border-neutral-900 p-4 rounded space-y-3">
              <h3 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-300 pb-2 border-b border-neutral-900 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#C52222]" />
                <span>DATOS DEL COMPRADOR</span>
              </h3>
              <div className="space-y-1.5 text-neutral-300">
                <p><strong className="text-white text-sm font-condensed tracking-wide">{order.customer?.firstName} {order.customer?.lastName}</strong></p>
                <p className="text-neutral-400 font-mono text-[11px]">RUT / DNI: <span className="text-white font-semibold">{order.customer?.rut || 'No especificado'}</span></p>
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <a href={`mailto:${order.customer?.email}`} className="text-neutral-200 hover:text-white underline">{order.customer?.email}</a>
                </p>
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-neutral-200 font-mono">{order.customer?.phone}</span>
                </p>
                <p className="text-[11px] text-neutral-500 pt-1">Fecha de Compra: <strong className="text-neutral-300">{order.date}</strong></p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-black/60 border border-neutral-900 p-4 rounded space-y-3">
              <h3 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-300 pb-2 border-b border-neutral-900 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C52222]" />
                <span>DIRECCIÓN DE DESPACHO 🇨🇱</span>
              </h3>
              <div className="space-y-1.5 text-neutral-300">
                <p className="text-white font-medium">{order.customer?.address}</p>
                <p className="text-neutral-400">{order.customer?.city}, {order.customer?.region}</p>
                <p className="text-neutral-400 font-mono text-[11px]">Código Postal: <span className="text-neutral-300">{order.customer?.postalCode || '7500000'}</span></p>
                <p className="text-neutral-400 font-condensed tracking-wider uppercase text-[11px]">
                  MÉTODO DE ENVÍO: <span className="text-white font-bold">{order.customer?.shippingMethod === 'starken' ? 'STARKEN POR PAGAR' : 'CHILEXPRESS EXPRESS 24H'}</span>
                </p>
                {order.trackingNumber && (
                  <p className="bg-[#151515] p-2 border border-neutral-800 rounded text-[11px] font-mono text-emerald-400">
                    Tracking: <strong className="text-white">{order.trackingNumber}</strong>
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Ordered Garments Table */}
          <div className="bg-black/60 border border-neutral-900 p-4 rounded space-y-3">
            <h3 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-300 pb-2 border-b border-neutral-900 flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-[#C52222]" />
              <span>PRENDAS INCLUIDAS EN EL PEDIDO ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-neutral-900">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-black border border-neutral-800 rounded p-1 shrink-0">
                      <img 
                        src={item.product?.image || '/producto.png'} 
                        alt={item.product?.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/producto.png'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-condensed font-bold uppercase text-white truncate text-sm">
                        {item.product?.name || 'Prenda Patria'}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        SKU: <span className="text-neutral-300">{item.product?.sku || 'PN-SKU'}</span> • Talla: <span className="text-[#C52222] font-bold">{item.size}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-condensed font-bold text-white text-sm">
                      €{(item.product?.price * (item.quantity || 1)).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {item.quantity} x €{item.product?.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals Breakdown */}
          <div className="bg-black/60 border border-neutral-900 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1 text-neutral-400">
              <span className="font-condensed font-bold text-xs uppercase tracking-wider text-neutral-300 block mb-1">
                FORMA DE PAGO
              </span>
              <p className="text-xs text-white uppercase font-medium flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#C52222]" />
                <span>{order.customer?.paymentMethod || 'Webpay Plus / Tarjeta'}</span>
              </p>
              <p className="text-[11px] text-neutral-500">Transacción certificada SSL 256-bit</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs font-condensed tracking-wider uppercase border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-900">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL:</span>
                <span className="font-mono text-white">€{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#C52222]">
                  <span>DESCUENTO:</span>
                  <span className="font-mono">-€{order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>ENVÍO:</span>
                <span className="font-mono text-white">{order.shippingCost === 0 ? 'GRATIS' : `€${order.shippingCost?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>TOTAL PEDIDO:</span>
                <span className="text-[#C52222] font-mono">€{order.finalTotal?.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono text-right">
                CLP ${(order.finalTotal * 1050).toLocaleString('es-CL')} aprox.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-[#0e0e0e] flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#181818] hover:bg-neutral-800 text-neutral-300 text-xs font-condensed font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            CERRAR DETALLE
          </button>
        </div>

      </div>
    </div>
  );
};
