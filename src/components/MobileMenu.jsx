import React from 'react';
import { Link } from 'react-router-dom';
import { X, Instagram, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileMenu = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useCart();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex">
      <div className="w-72 bg-black border-r border-neutral-800 h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-left duration-300">
        
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-6">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-12 block">
              <img 
                src="/logo.webp" 
                alt="Shield Logo" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                className="w-full h-full object-contain" 
              />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-4 font-condensed text-sm font-bold tracking-[0.2em] text-neutral-300">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block hover:text-[#C52222] transition-colors uppercase"
            >
              INICIO
            </Link>
            <Link 
              to="/catalogo" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block hover:text-[#C52222] transition-colors uppercase"
            >
              CATÁLOGO
            </Link>
            <Link 
              to="/quienes-somos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block hover:text-[#C52222] transition-colors uppercase"
            >
              QUIÉNES SOMOS
            </Link>
            <a 
              href="https://www.instagram.com/patria.nostra.distro/" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-[#C52222] transition-colors uppercase"
            >
              <Instagram className="w-4 h-4" />
              <span>INSTAGRAM</span>
            </a>
            <Link 
              to="/contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-[#C52222] transition-colors uppercase"
            >
              <Mail className="w-4 h-4" />
              <span>CONTACTO</span>
            </Link>
          </nav>

          {/* Categorías en menú móvil */}
          <div className="pt-4 mt-4 border-t border-neutral-900">
            <span className="text-[10px] font-condensed tracking-[0.25em] text-[#C52222] font-bold uppercase block mb-3">
              CATEGORÍAS
            </span>
            <div className="grid grid-cols-2 gap-2 font-condensed text-xs font-semibold tracking-wider text-neutral-400">
              <Link to="/catalogo?cat=POLERAS" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                POLERAS
              </Link>
              <Link to="/catalogo?cat=CDS" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                CDS
              </Link>
              <Link to="/catalogo?cat=VINILOS" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                VINILOS
              </Link>
              <Link to="/catalogo?cat=JOCKEYS" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                JOCKEYS
              </Link>
              <Link to="/catalogo?cat=BALACLAVAS" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                BALACLAVAS
              </Link>
              <Link to="/catalogo?cat=POLERONES" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white uppercase py-1">
                POLERONES
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-900 text-xs text-neutral-500">
          <p className="font-condensed tracking-widest text-[#C52222] uppercase font-bold">PATRIA NOSTRA</p>
          <p className="text-[10px] mt-1">Streetwear Underground • Chile 🇨🇱</p>
        </div>

      </div>
    </div>
  );
};
