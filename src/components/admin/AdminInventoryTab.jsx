import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Minus, 
  ExternalLink,
  PackageCheck, 
  PackageX,
  Layers
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCLP } from '../../utils/currency';
import { sortSizes } from '../../utils/sizes';

export const AdminInventoryTab = () => {
  const { products, updateStock, adjustStock, updateSizeStock, adjustSizeStock } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, CRITICAL_SIZES, LOW, OUT, NORMAL
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0);
  const outOfStockProducts = products.filter(p => (p.stock || 0) <= 0);
  const healthyProducts = products.filter(p => (p.stock || 0) >= 10);

  // Contar variantes de talla individuales que tienen 0 stock
  const outOfStockSizesCount = useMemo(() => {
    let count = 0;
    products.forEach(p => {
      const sizes = p.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
      const sizeStock = p.sizeStock || {};
      sizes.forEach(sz => {
        if ((sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 0) <= 0) {
          count++;
        }
      });
    });
    return count;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const stock = p.stock || 0;
      const sizes = p.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
      const sizeStock = p.sizeStock || {};
      const hasOutOfStockSize = sizes.some(sz => (sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 0) <= 0);

      if (stockFilter === 'CRITICAL_SIZES' && !hasOutOfStockSize) return false;
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

  const handleRestockEmptySizes = () => {
    let restockedCount = 0;
    products.forEach(p => {
      const sizes = p.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
      const sizeStock = p.sizeStock || {};
      sizes.forEach(sz => {
        const qty = sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 0;
        if (qty <= 0) {
          adjustSizeStock(p.id, sz, 5);
          restockedCount++;
        }
      });
    });
    showNotification(`Se reabastecieron +5 unidades en ${restockedCount} tallas agotadas.`);
  };

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
            CONTROL DE INVENTARIO &amp; TALLAS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestiona unidades exactas disponibles para cada talla (S, M, L, XL, XXL) en tiempo real.
          </p>
        </div>

        {outOfStockSizesCount > 0 && (
          <button
            onClick={handleRestockEmptySizes}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REABASTECER +5 A TALLAS AGOTADAS ({outOfStockSizesCount})</span>
          </button>
        )}
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              UNIDADES TOTALES
            </span>
            <Boxes className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">{totalStock}</div>
          <span className="text-[10px] text-neutral-500">En todo el catálogo</span>
        </div>

        {/* Critical Sizes */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              TALLAS AGOTADAS
            </span>
            <AlertTriangle className={`w-4 h-4 ${outOfStockSizesCount > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
          </div>
          <div className={`font-mono text-2xl sm:text-3xl font-extrabold ${outOfStockSizesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {outOfStockSizesCount}
          </div>
          <span className="text-[10px] text-neutral-500">Variantes en 0 unidades</span>
        </div>

        {/* Normal Stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              STOCK ÓPTIMO
            </span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400">{healthyProducts.length}</div>
          <span className="text-[10px] text-neutral-500">&gt;= 10 unidades disponibles</span>
        </div>

        {/* Out of stock */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-[11px] font-bold uppercase tracking-wider text-red-400">
              AGOTADOS TOTALES
            </span>
            <PackageX className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-red-400">{outOfStockProducts.length}</div>
          <span className="text-[10px] text-neutral-500">0 unidades en bodega</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a0a0a] border border-neutral-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nombre de prenda o SKU..."
            className="w-full bg-black border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'CRITICAL_SIZES', label: `Tallas Agotadas (${outOfStockSizesCount})` },
            { id: 'LOW', label: 'Stock Bajo (<10)' },
            { id: 'OUT', label: 'Agotados (0)' },
            { id: 'NORMAL', label: 'Stock Normal (>=10)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStockFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                stockFilter === f.id ? 'bg-[#C52222] text-white' : 'bg-black border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table with Size-by-Size Controls */}
      <div className="bg-[#080808] border border-neutral-900 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0c0c0c] text-[10px] font-condensed tracking-widest text-neutral-400 uppercase">
                <th className="py-3.5 px-4 font-bold min-w-[240px]">PRENDA &amp; MODELO</th>
                <th className="py-3.5 px-3 font-bold">PRECIO</th>
                <th className="py-3.5 px-3 font-bold text-center">TOTAL</th>
                <th className="py-3.5 px-4 font-bold">STOCK POR TALLA (GESTIÓN INDIVIDUAL)</th>
                <th className="py-3.5 px-4 font-bold text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredProducts.map(product => {
                const stock = product.stock || 0;
                const isOut = stock <= 0;
                const isLow = stock < 10 && stock > 0;
                const rawSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
                const sizes = sortSizes(rawSizes);
                const sizeStock = product.sizeStock || {};

                return (
                  <tr key={product.id} className="hover:bg-neutral-900/40 transition-colors">
                    
                    {/* Product & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black border border-neutral-800 rounded-lg p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={product.image || '/producto.webp'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/producto.webp'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-condensed font-bold text-sm text-white uppercase block truncate">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-neutral-500">
                              {product.sku || 'PN-SKU'}
                            </span>
                            <span className="text-neutral-700">•</span>
                            <span className="font-condensed text-[10px] text-[#C52222] font-semibold uppercase">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price in CLP */}
                    <td className="py-3.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                      {formatCLP(product.price)}
                    </td>

                    {/* Total Stock & Status Badge */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-bold text-sm text-white">
                          {stock} u.
                        </span>
                        <span className={`inline-block px-1.5 py-0.2 text-[9px] font-condensed font-bold uppercase rounded mt-0.5 border ${
                          isOut ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                          isLow ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isOut ? 'AGOTADO' : isLow ? 'BAJO' : 'STOCK'}
                        </span>
                      </div>
                    </td>

                    {/* Stock Individual por Talla (Interactive Steppers & Inputs) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {sizes.map(sz => {
                          const qty = sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 0;
                          const isSzOut = qty <= 0;
                          const isSzLow = qty > 0 && qty <= 2;

                          return (
                            <div 
                              key={sz}
                              className={`flex items-center bg-black border rounded-lg px-2 py-1 gap-1.5 transition-all ${
                                isSzOut 
                                  ? 'border-red-900/70 bg-red-950/15' 
                                  : isSzLow 
                                    ? 'border-amber-900/70 bg-amber-950/15' 
                                    : 'border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              <span className={`font-condensed font-bold text-xs uppercase w-4 text-center ${
                                isSzOut ? 'text-red-400' : isSzLow ? 'text-amber-300' : 'text-neutral-300'
                              }`}>
                                {sz}
                              </span>

                              <button
                                type="button"
                                onClick={() => adjustSizeStock(product.id, sz, -1)}
                                disabled={qty <= 0}
                                className="w-5 h-5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 text-neutral-300 hover:text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                                title={`Restar 1 a talla ${sz}`}
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={qty}
                                onChange={(e) => updateSizeStock(product.id, sz, e.target.value)}
                                className={`w-9 text-center bg-black/90 border rounded py-0.5 font-mono font-bold text-xs focus:outline-none focus:border-[#C52222] ${
                                  isSzOut ? 'text-red-400 border-red-900/60' : isSzLow ? 'text-amber-400 border-amber-900/60' : 'text-white border-neutral-800'
                                }`}
                                title={`Stock exacto de talla ${sz}`}
                              />

                              <button
                                type="button"
                                onClick={() => adjustSizeStock(product.id, sz, 1)}
                                className="w-5 h-5 bg-neutral-900 hover:bg-[#C52222] text-neutral-300 hover:text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                                title={`Sumar 1 a talla ${sz}`}
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Quick row actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sizes.forEach(sz => adjustSizeStock(product.id, sz, 5));
                            showNotification(`+5 u. en todas las tallas de ${product.name}`);
                          }}
                          className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#C52222] text-neutral-300 hover:text-white rounded-lg font-condensed font-bold text-[11px] tracking-wider uppercase transition-colors cursor-pointer"
                          title="Añadir +5 a cada talla de este producto"
                        >
                          +5 TODAS
                        </button>
                        <a
                          href={`/producto/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#141414] hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
                          title="Ver en Tienda"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
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
