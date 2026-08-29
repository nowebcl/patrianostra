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
              <img src="/logo.png" alt="Shield Logo" className="w-full h-full object-contain" />
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
        </div>

        <div className="pt-6 border-t border-neutral-900 text-xs text-neutral-500">
          <p className="font-condensed tracking-widest text-[#C52222] uppercase font-bold">PATRIA NOSTRA</p>
          <p className="text-[10px] mt-1">Streetwear Underground • Chile 🇨🇱</p>
        </div>

      </div>
    </div>
  );
};
