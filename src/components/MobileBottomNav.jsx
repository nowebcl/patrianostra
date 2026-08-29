import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  const isHome = location.pathname === '/';
  const isCatalog = location.pathname === '/catalogo';

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-black/95 border-t border-neutral-900 z-40 backdrop-blur-md px-4 py-2 flex items-center justify-around select-none">
      
      {/* Home Tab */}
      <Link 
        to="/"
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors active:scale-95 ${
          isHome ? 'text-[#C52222]' : 'text-neutral-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-condensed font-bold tracking-widest uppercase">INICIO</span>
      </Link>

      {/* Catalog Tab */}
      <Link 
        to="/catalogo"
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors active:scale-95 ${
          isCatalog ? 'text-[#C52222]' : 'text-neutral-400 hover:text-white'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[9px] font-condensed font-bold tracking-widest uppercase">CATÁLOGO</span>
      </Link>

      {/* Search Tab */}
      <Link 
        to="/catalogo"
        className="flex flex-col items-center gap-1 py-1 px-3 text-neutral-400 hover:text-white transition-colors active:scale-95"
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-condensed font-bold tracking-widest uppercase">BUSCAR</span>
      </Link>

      {/* Cart Tab */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-1 py-1 px-3 text-neutral-400 hover:text-white transition-colors relative active:scale-95 cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[9px] font-condensed font-bold tracking-widest uppercase">CARRITO</span>
        {totalItems > 0 && (
          <span className="absolute top-0 right-2 bg-[#C52222] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

    </div>
  );
};
