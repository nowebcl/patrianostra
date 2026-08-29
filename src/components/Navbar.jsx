import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, Instagram, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { totalItems, setIsCartOpen, setIsMobileMenuOpen } = useCart();

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-neutral-900 sticky top-[33px] sm:top-[35px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 grid grid-cols-3 items-center">
        
        {/* 1. Left Column: Desktop 2 items (INICIO | CATÁLOGO) / Mobile Hamburger */}
        <div className="flex items-center justify-start">
          {/* Desktop Left Menu */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-condensed font-semibold tracking-[0.2em] text-neutral-300">
            <Link to="/" className="hover:text-white transition-colors duration-200 uppercase">
              INICIO
            </Link>
            <span className="text-neutral-800 select-none">|</span>
            <Link to="/catalogo" className="hover:text-white transition-colors duration-200 uppercase">
              CATÁLOGO
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-neutral-300 hover:text-white p-2 cursor-pointer -ml-2" 
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Center Column: Pure Mathematical Center Logo */}
        <div className="flex items-center justify-center">
          <Link to="/" className="group block relative">
            <div className="w-12 h-14 sm:w-16 sm:h-18 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Patria Nostra Logo Shield" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
              />
            </div>
          </Link>
        </div>

        {/* 3. Right Column: Desktop (INSTAGRAM | CONTACTO | CARRITO) / Mobile Cart */}
        <div className="flex items-center justify-end">
          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-5 text-xs font-condensed font-semibold tracking-[0.2em] text-neutral-300">
            <a 
              href="https://www.instagram.com/patria.nostra.distro/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#C52222] transition-colors duration-200 uppercase flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM</span>
            </a>
            <span className="text-neutral-800 select-none">|</span>
            <Link 
              to="/contacto"
              className="hover:text-white transition-colors duration-200 uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>CONTACTO</span>
            </Link>
            <span className="text-neutral-800 select-none">|</span>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#121212] hover:bg-[#C52222] text-neutral-200 hover:text-white border border-neutral-800 hover:border-[#C52222] px-3.5 py-2 font-condensed tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              <span>CARRITO (<span className="text-[#C52222] group-hover:text-white font-bold">{totalItems}</span>)</span>
            </button>
          </div>

          {/* Mobile Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex lg:hidden text-neutral-300 hover:text-white p-2 relative cursor-pointer active:scale-95 -mr-2" 
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute top-1 right-1 bg-[#C52222] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
