import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCLP } from '../../utils/currency';

const STATUS_LIST = ['TODOS', 'PENDIENTE', 'EN PREPARACIÓN', 'ENVIADO', 'ENTREGADO'];

export const AdminOrdersTab = () => {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (selectedStatus !== 'TODOS' && o.status?.toUpperCase() !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.orderNumber?.toLowerCase().includes(q);
        const matchName = `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase().includes(q);
        const matchCity = o.customer?.city?.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchCity) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleStatusChange = (orderNumber, newStatus) => {
    updateOrderStatus(orderNumber, newStatus);
    showNotification(`Pedido ${orderNumber} → ${newStatus}`);
  };

  const handleSaveTracking = (orderNumber, track) => {
    updateOrderStatus(orderNumber, null, track.trim());
    showNotification(`Tracking guardado para ${orderNumber}`);
  };

  const totalSales = orders
    .filter(o => o.status !== 'Cancelado')
    .reduce((s, o) => s + (o.finalTotal || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151515] border border-[#C52222] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#C52222]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide">
            Pedidos Recibidos
          </h1>
          <p className="text-xs text-neutral-400">
            {orders.length} pedidos registrados • Total vendido: <strong className="text-white font-mono">{formatCLP(totalSales)}</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, comuna o orden..."
            className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C52222]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_LIST.map(st => {
            const count = st === 'TODOS' ? orders.length : orders.filter(o => o.status?.toUpperCase() === st).length;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#C52222] text-white shadow'
                    : 'bg-[#121212] border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Orders List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#111] border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 space-y-2">
          <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
          <p className="font-condensed text-sm font-bold uppercase text-white">No hay pedidos en esta sección</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'Entregado';
            const isShipped = order.status === 'Enviado';
            const isProcessing = order.status === 'En Preparación';

            return (
              <div
                key={order.orderNumber}
                className="bg-[#111111] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 space-y-4 transition-all hover:border-neutral-700"
              >
                
                {/* 1. Card Top: Order Number, Date & Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-base sm:text-lg text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-neutral-500 text-xs font-mono">
                      {order.date}
                    </span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase border cursor-pointer focus:outline-none ${
                      isDelivered ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' :
                      isShipped ? 'bg-purple-950/60 text-purple-300 border-purple-700' :
                      isProcessing ? 'bg-blue-950/60 text-blue-300 border-blue-700' :
                      'bg-amber-950/60 text-amber-300 border-amber-700'
                    }`}
                  >
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="En Preparación">🔵 En Preparación</option>
                    <option value="Enviado">🟣 Enviado</option>
                    <option value="Entregado">🟢 Entregado</option>
                    <option value="Cancelado">🔴 Cancelado</option>
                  </select>
                </div>

                {/* 2. Middle: Customer Info & Items in 2 clean columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-xs">
                  
                  {/* Customer Info */}
                  <div className="md:col-span-6 bg-[#080808] border border-neutral-800/80 rounded-xl p-3.5 space-y-2">
                    <div className="font-condensed font-bold uppercase text-white text-sm flex items-center justify-between">
                      <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                      {order.customer?.rut && <span className="text-neutral-500 font-mono text-xs font-normal">{order.customer.rut}</span>}
                    </div>

                    <div className="space-y-1 text-neutral-300">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C52222] shrink-0 mt-0.5" />
                        <span><strong>{order.customer?.address}</strong>, {order.customer?.city}</span>
                      </p>
                      
                      <p className="flex items-center gap-2 pt-1">
                        <span className="font-mono text-neutral-400">{order.customer?.phone}</span>
                        <a 
                          href={`https://wa.me/${(order.customer?.phone || '').replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] font-condensed font-bold uppercase"
                        >
                          WhatsApp ↗
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="md:col-span-6 bg-[#080808] border border-neutral-800/80 rounded-xl p-3.5 space-y-2">
                    <span className="font-condensed font-bold uppercase text-neutral-400 text-[11px] block">
                      Prendas ({order.items?.reduce((s, i) => s + (i.quantity || 1), 0)} u.)
                    </span>

                    <div className="space-y-1.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 bg-neutral-900 rounded p-0.5 shrink-0 border border-neutral-800">
                              <img src={item.product?.image || '/producto.png'} alt="" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-condensed font-bold text-white uppercase text-xs truncate">
                              {item.product?.name} <span className="text-[#C52222]">({item.size})</span> x{item.quantity}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-neutral-300 shrink-0">
                            {formatCLP(item.product?.price * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 3. Bottom: Tracking & Total */}
                <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  
                  {/* Tracking input */}
                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <input
                      type="text"
                      defaultValue={order.trackingNumber || ''}
                      placeholder="Tracking Chilexpress / Starken..."
                      onBlur={(e) => handleSaveTracking(order.orderNumber, e.target.value)}
                      className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222]"
                    />
                  </div>

                  {/* Total & Delete Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 font-condensed uppercase block">
                        TOTAL ({order.customer?.paymentMethod || 'Webpay'})
                      </span>
                      <span className="font-mono text-base font-extrabold text-[#C52222]">
                        {formatCLP(order.finalTotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar pedido ${order.orderNumber}?`)) {
                          deleteOrder(order.orderNumber);
                          showNotification(`Pedido ${order.orderNumber} eliminado`);
                        }
                      }}
                      className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar pedido"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
