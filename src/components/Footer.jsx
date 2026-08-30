import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const Footer = () => {
  const { setIsManifestoOpen } = useCart();

  return (
    <footer className="bg-black text-neutral-400 pt-16 pb-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-8 pb-12 border-b border-neutral-900">
          
          {/* Col 1: Logo & Brand Emblem */}
          <div className="md:col-span-3 flex flex-col items-start">
            <div className="w-14 h-16 mb-4">
              <img 
                src="/logo.png" 
                alt="Patria Nostra Shield Emblem" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]"
              />
            </div>
            <span className="font-gothic text-xl text-neutral-300">patria nostra</span>
            <p className="text-[11px] text-neutral-500 mt-2 font-sans leading-relaxed">
              Identidad, lealtad y resistencia en cada puntada.
            </p>
          </div>

          {/* Col 2: Tienda */}
          <div className="md:col-span-2">
            <h4 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-200 mb-4">
              TIENDA
            </h4>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Todos los productos</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Hoodies</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Camisetas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Accesorios</a></li>
            </ul>
          </div>

          {/* Col 3: Información */}
          <div className="md:col-span-3">
            <h4 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-200 mb-4">
              INFORMACIÓN
            </h4>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Envíos y Entregas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><Link to="/admin" className="text-neutral-500 hover:text-[#C52222] transition-colors flex items-center gap-1 font-condensed tracking-wider uppercase pt-1">🔒 Panel Admin</Link></li>
            </ul>
          </div>

          {/* Col 4: La Marca */}
          <div className="md:col-span-2">
            <h4 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-200 mb-4">
              LA MARCA
            </h4>
            <ul className="space-y-2 text-xs font-sans text-neutral-400">
              <li>
                <button 
                  onClick={() => setIsManifestoOpen(true)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Manifiesto
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Historia</a></li>
              <li><a href="#colaboraciones" className="hover:text-white transition-colors">Colaboraciones</a></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Col 5: Síguenos */}
          <div className="md:col-span-2">
            <h4 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-200 mb-4">
              SÍGUENOS
            </h4>
            <div className="flex items-center space-x-4">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/patria.nostra.distro/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-neutral-400 hover:text-white transition-colors p-1" 
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="text-neutral-400 hover:text-white transition-colors p-1" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.582 9 4.615V8z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="text-neutral-400 hover:text-white transition-colors p-1" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-condensed tracking-[0.15em] text-neutral-500 uppercase">
          <div>
            © 2024 PATRIA NOSTRA. TODOS LOS DERECHOS RESERVADOS.
          </div>
          <div className="mt-3 sm:mt-0 flex items-center gap-1.5 text-neutral-400">
            <span>DISEÑADO SIN EXCUSAS.</span>
            <span className="text-[#C52222]">★</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
