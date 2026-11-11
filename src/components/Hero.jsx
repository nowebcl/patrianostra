import React from 'react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative bg-black min-h-[640px] sm:min-h-[740px] lg:min-h-[820px] flex items-center overflow-hidden border-b border-neutral-900">
      
      {/* Master Hero Background Artwork (Right Side Dominant on desktop, Full coverage on mobile) */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[70%] xl:w-[68%] h-full pointer-events-none select-none z-0 overflow-hidden flex justify-end items-end">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/portada.webp" 
            alt="Patria Nostra Distro Underground - Colección Oficial" 
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => { 
              e.currentTarget.onerror = null; 
              e.currentTarget.src = '/portada.png'; 
            }}
            className="w-full h-full object-cover object-center filter contrast-105 brightness-95"
          />
        </div>
        
        {/* Multi-stage Black Gradients for seamless feathered blend */}
        <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-black via-black/75 to-transparent z-20"></div>
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/80 to-transparent z-20"></div>
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="max-w-xl lg:max-w-2xl">
          
          {/* Subtitle Tag */}
          <div className="mb-4 sm:mb-6">
            <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs sm:text-sm uppercase inline-block">
              DESDE EL 2018
            </span>
          </div>

          {/* Main Gothic Title Logo Artwork */}
          <div className="mb-6 sm:mb-8 select-none">
            <h1 className="sr-only">Patria Nostra</h1>
            <img 
              src="/PATRIA NOSTRA PNG.png" 
              alt="Patria Nostra" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/patria-nostra-title.png'; }}
              className="w-auto h-32 sm:h-44 md:h-52 lg:h-60 max-w-[90vw] sm:max-w-md object-contain filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Descriptive Manifesto Paragraph */}
          <p className="text-neutral-400 font-sans text-xs sm:text-sm md:text-base leading-relaxed max-w-md mb-8 sm:mb-10 font-normal">
            Más que una distro, es una declaración de guerra contra todo lo podrido.<br />
            <span className="text-neutral-300 font-medium">No es Moda, es IDENTIDAD.</span>
          </p>

          {/* Action Button */}
          <div>
            <Link 
              to="/catalogo" 
              className="btn-crimson btn-brutalist bg-[#9E1B1B] hover:bg-[#C52222] text-white font-condensed font-bold text-sm tracking-[0.2em] uppercase px-8 py-4 hard-box inline-flex items-center gap-3 transition-all duration-200 glow-red-sm"
            >
              <span>VER COLECCIÓN</span>
              <span className="text-base">→</span>
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
};
