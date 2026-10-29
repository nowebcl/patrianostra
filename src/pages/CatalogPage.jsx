import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage = () => {
  const { products } = useStore();
  const [searchParams] = useSearchParams();
  const initialCat = (searchParams.get('cat') || searchParams.get('categoria') || 'TODOS').toUpperCase();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const cat = searchParams.get('cat') || searchParams.get('categoria');
    if (cat) {
      setSelectedCategory(cat.toUpperCase());
    }
    const qParam = searchParams.get('q') || searchParams.get('search');
    if (qParam !== null) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  const ITEMS_PER_PAGE = 16;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const categories = useMemo(() => {
    const base = ['TODOS', 'POLERAS', 'CDS', 'VINILOS', 'JOCKEYS', 'BALACLAVAS', 'POLERONES', 'MÚSICA', 'CASETES', 'EDICIÓN LIMITADA', 'PANTALONES', 'ACCESORIOS'];
    const fromProducts = products.map(p => (p.category || '').toUpperCase().trim()).filter(Boolean);
    return Array.from(new Set([...base, ...fromProducts]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizeCat = (str) => (str || '').toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const musicSubCats = ['MUSICA', 'VINILOS', 'VINILO', 'CDS', 'CD', 'CASETES', 'CASETE', 'CASSETTES', 'CASSETTE'];

    return products.filter(product => {
      // Category filter
      if (selectedCategory === 'EDICIÓN LIMITADA') {
        if (!product.badge) return false;
      } else if (selectedCategory !== 'TODOS') {
        const cat = normalizeCat(product.category);
        const sel = normalizeCat(selectedCategory);
        if (sel === 'POLERAS' || sel === 'CAMISETAS') {
          if (cat !== 'POLERAS' && cat !== 'CAMISETAS') return false;
        } else if (sel === 'POLERONES' || sel === 'POLERON') {
          if (cat !== 'POLERONES' && cat !== 'POLERON' && cat !== 'HOODIES' && cat !== 'HOODIE') return false;
        } else if (sel === 'MUSICA') {
          if (!musicSubCats.includes(cat)) return false;
        } else if (sel === 'VINILOS' || sel === 'VINILO') {
          if (cat !== 'VINILOS' && cat !== 'VINILO') return false;
        } else if (sel === 'CDS' || sel === 'CD') {
          if (cat !== 'CDS' && cat !== 'CD') return false;
        } else if (sel === 'CASETES' || sel === 'CASETE') {
          if (cat !== 'CASETES' && cat !== 'CASETE' && cat !== 'CASSETTES' && cat !== 'CASSETTE') return false;
        } else if (sel === 'JOCKEYS' || sel === 'JOCKEY') {
          if (cat !== 'JOCKEYS' && cat !== 'JOCKEY' && cat !== 'GORROS' && cat !== 'GORRA' && cat !== 'GORRAS') return false;
        } else if (sel === 'BALACLAVAS' || sel === 'BALACLAVA') {
          if (cat !== 'BALACLAVAS' && cat !== 'BALACLAVA' && cat !== 'PASAMONTANAS' && !cat.includes('BALACLAVA')) return false;
        } else if (cat !== sel) {
          return false;
        }
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
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

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
                CATÁLOGO OFICIAL
              </h1>
            </div>
            <p className="text-xs text-neutral-500 font-sans max-w-sm">
              Indumentaria, música (vinilos, CDs, casetes) y ediciones estrictamente limitadas.
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
              <span>MOSTRANDO {displayedProducts.length} DE {filteredProducts.length} PRODUCTOS</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-8 py-3.5 bg-black hover:bg-neutral-900 text-white border border-neutral-700 hover:border-white font-condensed font-bold tracking-[0.2em] text-xs uppercase transition-all duration-200 shadow-xl cursor-pointer"
                >
                  + CARGAR MÁS PRENDAS ({filteredProducts.length - visibleCount} RESTANTES)
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
