import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Plus, 
  Minus,
  Sparkles,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminInventoryTab = () => {
  const { products, updateStock, adjustStock } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, OUT, NORMAL
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0);
  const outOfStockProducts = products.filter(p => (p.stock || 0) <= 0);
  const healthyProducts = products.filter(p => (p.stock || 0) >= 10);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const stock = p.stock || 0;
      if (stockFilter === 'LOW' && (stock >= 10 || stock === 0)) return false;
      if (stockFilter === 'OUT' && stock > 0) return false;
      if (stockFilter === 'NORMAL' && stock < 10) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [products, stockFilter, searchQuery]);

  const handleBatchRestockLow = () => {
    lowStockProducts.forEach(p => {
      adjustStock(p.id, 10);
    });
    outOfStockProducts.forEach(p => {
      adjustStock(p.id, 10);
    });
    showNotification(`Se añadieron +10 unidades a todos los productos con stock bajo o agotados`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-[#C52222] text-white px-4 py-3 rounded shadow-2xl flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#C52222]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
        <div>
          <span className="text-[#C52222] font-condensed font-bold text-xs tracking-[0.25em] uppercase block mb-1">
            CONTROL DE BODEGA &amp; ALMACÉN
          </span>
          <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
            CONTROL DE INVENTARIO
          </h1>
        </div>

        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <button
            onClick={handleBatchRestockLow}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-condensed font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REABASTECER +10 A TODOS LOS CRÍTICOS</span>
          </button>
        )}
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              UNIDADES TOTALES
            </span>
            <Boxes className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white">{totalStock}</div>
          <span className="text-[10px] text-neutral-500">En todo el catálogo</span>
        </div>

        {/* Normal Stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              EN STOCK ÓPTIMO
            </span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">{healthyProducts.length}</div>
          <span className="text-[10px] text-neutral-500">&gt;= 10 unidades disponibles</span>
        </div>

        {/* Low Stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-amber-400">
              STOCK BAJO
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-400">{lowStockProducts.length}</div>
          <span className="text-[10px] text-neutral-500">1 a 9 unidades restantes</span>
        </div>

        {/* Out of stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-red-400">
              AGOTADOS
            </span>
            <PackageX className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-red-400">{outOfStockProducts.length}</div>
          <span className="text-[10px] text-neutral-500">0 unidades en bodega</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a0a0a] border border-neutral-900 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nombre de prenda o SKU..."
            className="w-full bg-black border border-neutral-800 rounded pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'NORMAL', label: 'Stock Normal (>=10)' },
            { id: 'LOW', label: 'Stock Bajo (<10)' },
            { id: 'OUT', label: 'Agotados (0)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStockFilter(f.id)}
              className={`px-3 py-1.5 rounded text-xs font-condensed font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                stockFilter === f.id ? 'bg-[#C52222] text-white' : 'bg-black border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#080808] border border-neutral-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0c0c0c] text-[10px] font-condensed tracking-widest text-neutral-400 uppercase">
                <th className="py-3.5 px-4 font-bold">PRENDA &amp; MODELO</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">CATEGORÍA</th>
                <th className="py-3.5 px-4 font-bold">PRECIO</th>
                <th className="py-3.5 px-4 font-bold">ESTADO NIVEL</th>
                <th className="py-3.5 px-4 font-bold text-center">STOCK ACTUAL</th>
                <th className="py-3.5 px-4 font-bold text-right">AJUSTE RÁPIDO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredProducts.map(product => {
                const stock = product.stock || 0;
                const isOut = stock <= 0;
                const isLow = stock < 10 && stock > 0;
                const isHealthy = stock >= 10;

                return (
                  <tr key={product.id} className="hover:bg-neutral-900/40 transition-colors">
                    
                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black border border-neutral-800 rounded p-1 shrink-0">
                          <img
                            src={product.image || '/producto.png'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/producto.png'; }}
                          />
                        </div>
                        <div>
                          <span className="font-condensed font-bold text-sm text-white uppercase block">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            Tallas: {product.sizes?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-condensed uppercase font-semibold text-neutral-300">
                      {product.category}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      €{Number(product.price).toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-condensed font-bold uppercase rounded border ${
                        isOut ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                        isLow ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {isOut ? '● AGOTADO' : isLow ? '▲ STOCK BAJO' : '✓ EN STOCK'}
                      </span>
                    </td>

                    {/* Current Stock with direct input */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={product.stock}
                        onChange={(e) => updateStock(product.id, e.target.value)}
                        className={`w-16 bg-black border rounded text-center py-1 font-mono font-bold text-sm focus:outline-none focus:border-[#C52222] ${
                          isOut ? 'border-red-600 text-red-400' : isLow ? 'border-amber-600 text-amber-400' : 'border-neutral-800 text-white'
                        }`}
                      />
                    </td>

                    {/* Quick adjustments */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => adjustStock(product.id, -5)}
                          disabled={stock <= 0}
                          className="px-2 py-1 bg-[#141414] hover:bg-neutral-800 disabled:opacity-30 text-neutral-400 hover:text-white rounded font-mono text-[11px] cursor-pointer"
                          title="-5 unidades"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, -1)}
                          disabled={stock <= 0}
                          className="px-2 py-1 bg-[#141414] hover:bg-neutral-800 disabled:opacity-30 text-neutral-400 hover:text-white rounded font-mono text-[11px] cursor-pointer"
                          title="-1 unidad"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, 1)}
                          className="px-2 py-1 bg-[#141414] hover:bg-[#C52222] text-neutral-300 hover:text-white rounded font-mono text-[11px] cursor-pointer"
                          title="+1 unidad"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, 5)}
                          className="px-2 py-1 bg-[#141414] hover:bg-[#C52222] text-neutral-300 hover:text-white rounded font-mono text-[11px] cursor-pointer"
                          title="+5 unidades"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, 10)}
                          className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#C52222] text-white rounded font-mono font-bold text-[11px] cursor-pointer"
                          title="+10 unidades"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
