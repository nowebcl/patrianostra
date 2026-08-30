import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Plus, 
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCLP } from '../../utils/currency';

export const AdminOverviewTab = ({ setActiveTab, onOpenNewProduct }) => {
  const { products, orders, updateOrderStatus } = useStore();

  const totalSales = orders
    .filter(o => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En Preparación');
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide">
            Resumen General
          </h1>
          <p className="text-xs text-neutral-400">
            Vista rápida de ventas, despachos e inventario
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Prenda</span>
        </button>
      </div>

      {/* 3 Clean Big Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Ventas */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-[#111111] border border-neutral-800/80 hover:border-neutral-700 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-neutral-400">
              Total Vendido
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C52222]/15 text-[#C52222] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {formatCLP(totalSales)}
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 font-condensed uppercase group-hover:text-white">
            <span>{orders.length} pedidos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C52222]" />
          </div>
        </div>

        {/* 2. Pedidos Pendientes */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-[#111111] border border-neutral-800/80 hover:border-neutral-700 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-neutral-400">
              Por Despachar
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {pendingOrders.length}
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 font-condensed uppercase group-hover:text-white">
            <span>Ver despachos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C52222]" />
          </div>
        </div>

        {/* 3. Prendas & Stock */}
        <div 
          onClick={() => setActiveTab('products')}
          className="bg-[#111111] border border-neutral-800/80 hover:border-neutral-700 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-neutral-400">
              Prendas en Tienda
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {products.length}
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 font-condensed uppercase group-hover:text-white">
            <span>{totalStockUnits} unidades totales</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C52222]" />
          </div>
        </div>

      </div>

      {/* Recent Orders Overview */}
      <div className="bg-[#111111] border border-neutral-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
          <h2 className="font-condensed text-base font-bold uppercase text-white tracking-wide">
            Últimos Pedidos
          </h2>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-condensed font-bold text-[#C52222] hover:underline uppercase flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentOrders.map(order => (
            <div
              key={order.orderNumber}
              className="bg-[#080808] border border-neutral-800/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <span className="font-mono font-bold text-white block">{order.orderNumber}</span>
                <span className="text-neutral-400 text-[11px] truncate block">
                  {order.customer?.firstName} {order.customer?.lastName} • {order.customer?.city}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-[#C52222]">
                  {formatCLP(order.finalTotal)}
                </span>

                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-condensed font-bold uppercase bg-[#181818] border border-neutral-700 text-white cursor-pointer focus:outline-none"
                >
                  <option value="Pendiente">🟡 Pendiente</option>
                  <option value="En Preparación">🔵 En Preparación</option>
                  <option value="Enviado">🟣 Enviado</option>
                  <option value="Entregado">🟢 Entregado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
