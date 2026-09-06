import React from 'react';
import { useCart } from '../context/CartContext';

export const ManifestoSection = () => {
  const { setIsManifestoOpen } = useCart();

  return (
    <section className="bg-black py-14 sm:py-20 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Manifesto Copy & Button */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            <div className="mb-3">
              <span className="text-[#C52222] font-condensed font-bold tracking-[0.2em] text-xs uppercase inline-block">
                NUESTRA CAUSA
              </span>
            </div>

            <h2 className="font-condensed text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight mb-5">
              ESTO ES MÁS QUE ROPA.<br />
              ES NUESTRA FORMA DE LUCHAR.
            </h2>

            <p className="text-neutral-400 font-sans text-xs sm:text-sm leading-relaxed mb-8">
              Patria Nostra nace desde la música, la historia y la calle. Cada prenda lleva un mensaje. Cada diseño, una postura. No seguimos tendencias. Seguimos convicciones.
            </p>

            <div>
              <button 
                onClick={() => setIsManifestoOpen(true)}
                className="btn-outline-dark font-condensed font-bold text-xs sm:text-sm tracking-[0.2em] uppercase px-7 py-3.5 inline-flex items-center gap-2 border border-neutral-800 text-neutral-200 transition-all duration-200 cursor-pointer"
              >
                <span>LEER MANIFIESTO</span>
                <span>→</span>
              </button>
            </div>

          </div>

          {/* Right: Clean Video with Rounded Corners and Edge Fade */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
              
              <video
                src="/video.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover rounded-2xl filter contrast-105"
              />

              {/* Edge Fade feathered vignette blending seamlessly into pure black */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl [box-shadow:inset_0_0_40px_20px_rgba(0,0,0,0.85)]"></div>
              <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute inset-x-0 top-0 h-12 pointer-events-none bg-gradient-to-b from-black/60 to-transparent"></div>
              <div className="absolute inset-y-0 left-0 w-12 pointer-events-none bg-gradient-to-r from-black/60 to-transparent"></div>
              <div className="absolute inset-y-0 right-0 w-12 pointer-events-none bg-gradient-to-l from-black/60 to-transparent"></div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
