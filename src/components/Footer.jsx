import React, { useState } from 'react';
import { Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const InstagramIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const Footer = () => {
  const { setIsManifestoOpen } = useCart();
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  return (
    <footer className="bg-black text-neutral-400 pt-16 pb-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-8 pb-12 border-b border-neutral-900">
          
          {/* Col 1: Logo & Brand Emblem */}
          <div className="md:col-span-3 flex flex-col items-start">
            <div className="w-14 h-16 mb-4">
              <img 
                src="/logo.webp" 
                alt="Patria Nostra Shield Emblem" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]"
              />
            </div>
            <span className="font-gothic text-xl text-neutral-300">patria nostra distro</span>
            <p className="text-[11px] text-neutral-500 mt-2 font-sans leading-relaxed">
              Distro independiente nacida en 2018. Difusión y venta de música, indumentaria y material identitario.
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
              <li><button onClick={() => setIsShippingModalOpen(true)} className="hover:text-white transition-colors text-left cursor-pointer">Envíos y Entregas</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
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
              <li><Link to="/quienes-somos" className="hover:text-white transition-colors">Quiénes Somos</Link></li>
              <li><a href="#colaboraciones" className="hover:text-white transition-colors">Colaboraciones</a></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Col 5: Síguenos */}
          <div className="md:col-span-2">
            <h4 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-200 mb-4">
              SÍGUENOS
            </h4>
            <div>
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/patrianostradistro/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs font-sans text-neutral-400 hover:text-white transition-colors py-1" 
                aria-label="Instagram @patrianostradistro"
              >
                <InstagramIcon className="w-5 h-5 shrink-0" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-condensed tracking-[0.15em] text-neutral-500 uppercase">
          <div className="text-center md:text-left">
            © 2024 PATRIA NOSTRA. TODOS LOS DERECHOS RESERVADOS.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span>DISEÑADO SIN EXCUSAS.</span>
              <span className="text-[#C52222]">★</span>
            </div>

            <span className="hidden sm:inline text-neutral-800" aria-hidden="true">|</span>

            <a
              href="https://www.instagram.com/noweb.dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Desarrollado por NOWEB.DEV en Instagram"
              className="group inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <span>DESARROLLADO POR</span>
              <span className="font-bold text-neutral-200 group-hover:text-[#C52222] transition-colors">
                NOWEB.DEV
              </span>
              <InstagramIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#C52222] transition-colors" />
            </a>
          </div>
        </div>

      </div>
    
      {/* Shipping Policy Modal */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-neutral-800 w-full max-w-md p-6 rounded relative shadow-2xl">
            <button
              onClick={() => setIsShippingModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-[#C52222]">
              <Truck className="w-5 h-5 shrink-0" />
              <h3 className="font-condensed font-bold text-base tracking-widest uppercase text-white">
                ENVÍOS Y ENTREGAS
              </h3>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans mb-4">
              Todos los pedidos se despachan después de 24/48 horas laborales. Agencia a convenir por el comprador.
            </p>
            <div className="bg-black border border-neutral-900 p-3 rounded text-[11px] text-neutral-400 space-y-1">
              <p>📍 Despachos a todo Chile.</p>
              <p>✉️ Dudas o coordinación: <a href="mailto:contacto@patrianostradistro.cl" className="text-white hover:text-[#C52222] font-mono">contacto@patrianostradistro.cl</a></p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
