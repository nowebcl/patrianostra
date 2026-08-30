import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage = () => {
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['TODOS', 'POLERONES', 'CAMISETAS', 'EDICIÓN LIMITADA', 'PANTALONES', 'ACCESORIOS'];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory === 'EDICIÓN LIMITADA') {
        if (!product.badge) return false;
      } else if (selectedCategory !== 'TODOS') {
        if (product.category.toUpperCase() !== selectedCategory && 
            !(selectedCategory === 'POLERONES' && product.category?.toUpperCase() === 'HOODIES')) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-neutral-900 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs uppercase block mb-1">
                COLECCIÓN OFICIAL
              </span>
              <h1 className="font-condensed text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white">
                CATÁLOGO INDUMENTARIA
              </h1>
            </div>
            <p className="text-xs text-neutral-500 font-sans max-w-sm">
              Lotes estrictamente limitados. Gramaje superior y serigrafía artesanal curada al horno.
            </p>
          </div>
        </div>

        {/* Minimal Search and Filter Bar */}
        <div className="bg-[#080808] border border-neutral-900 p-4 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR PRENDA, TALLA O EDICIÓN..."
              className="w-full bg-black border border-neutral-800 text-xs font-condensed tracking-wider text-neutral-200 pl-10 pr-9 py-2.5 placeholder:text-neutral-600 focus:outline-none focus:border-[#C52222] uppercase"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-condensed tracking-wider text-neutral-500 uppercase">ORDEN:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border border-neutral-800 text-xs font-condensed tracking-wider text-neutral-300 px-3 py-2 focus:outline-none focus:border-[#C52222] uppercase cursor-pointer"
            >
              <option value="featured">DESTACADOS</option>
              <option value="price-asc">PRECIO: MENOR A MAYOR</option>
              <option value="price-desc">PRECIO: MAYOR A MENOR</option>
              <option value="name-asc">NOMBRE A - Z</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-condensed font-bold tracking-[0.18em] uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C52222] text-white'
                  : 'bg-[#0A0A0A] border border-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid Results */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-900">
            <p className="font-condensed text-lg text-neutral-400 uppercase tracking-wider">
              NO SE ENCONTRARON PRENDAS
            </p>
            <p className="text-xs text-neutral-600 mt-2 font-sans">
              Intenta con otro término de búsqueda o restablece los filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('TODOS');
              }}
              className="mt-4 px-6 py-2.5 bg-[#141414] hover:bg-neutral-800 text-neutral-300 text-xs font-condensed uppercase tracking-widest border border-neutral-700 cursor-pointer"
            >
              RESTABLECER FILTROS
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs font-condensed tracking-widest text-neutral-500 uppercase mb-4">
              <span>MOSTRANDO {filteredProducts.length} PRODUCTOS</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
