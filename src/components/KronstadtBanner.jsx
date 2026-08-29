import React from 'react';
import { Link } from 'react-router-dom';

export const KronstadtBanner = () => {
  return (
    <section id="kronstadt" className="bg-black w-full relative border-y border-neutral-900 overflow-hidden">
      {/* Full-bleed edge-to-edge immersive banner */}
      <div className="relative w-full overflow-hidden bg-black group">
        <img 
          src="/banner1.png" 
          alt="Kronstadt No Compromise x Patria Nostra Colaboración" 
          className="w-full h-auto min-h-[160px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[320px] object-cover object-center select-none filter contrast-105"
        />

        {/* Interactive Action Button */}
        <Link 
          to="/catalogo" 
          className="absolute left-[3.2%] bottom-[7%] sm:bottom-[9%] md:bottom-[10%] inline-flex items-center gap-2 bg-black/90 hover:bg-black text-neutral-200 hover:text-white border border-neutral-600 hover:border-white font-condensed font-bold text-[10px] sm:text-xs md:text-sm tracking-[0.2em] px-3.5 sm:px-6 py-1.5 sm:py-2.5 uppercase transition-all duration-200 shadow-2xl backdrop-blur-sm cursor-pointer"
        >
          <span>VER COLECCIÓN</span>
          <span className="text-sm">→</span>
        </Link>
      </div>
    </section>
  );
};
