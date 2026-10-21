import React from 'react';
import { Link } from 'react-router-dom';
import { Disc, Shield, Flame, Shirt, ArrowRight, Music, Compass } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="border-b border-neutral-900 pb-8 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs uppercase">
              DESDE 2018 • IDENTIDAD & DISTRO
            </span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-500 font-condensed tracking-wider text-xs uppercase">
              INFORMACIÓN OFICIAL
            </span>
          </div>

          <h1 className="font-condensed text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white mb-4">
            QUIÉNES SOMOS
          </h1>
          
          <p className="text-sm sm:text-base text-neutral-400 font-sans max-w-2xl leading-relaxed">
            Música, indumentaria y material de la escena nacionalista, patriota e identitaria. Sin intermediarios, sin modas pasajeras.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Official Manifesto Text */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Lead Card */}
            <div className="bg-[#080808] border border-neutral-900 p-6 sm:p-8 hard-box shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C52222]/5 rounded-bl-full pointer-events-none" />
              
              <div className="space-y-5 text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
                <p className="text-white font-medium text-base sm:text-lg leading-relaxed">
                  <strong className="text-[#C52222] uppercase tracking-wide">PATRIA NOSTRA DISTRO</strong> nace en 2018 como un proyecto independiente dedicado a la difusión y venta de música, indumentaria y material relacionado con bandas y artistas de la escena nacionalista, patriota e identitaria.
                </p>

                <p>
                  Desde nuestros comienzos hemos buscado reunir en un solo espacio música, ropa, ediciones físicas, merchandising y otros artículos vinculados a una escena que muchas veces permanece al margen de los circuitos comerciales tradicionales.
                </p>

                <p>
                  Además de distribuir material de diferentes agrupaciones, desarrollamos nuestra colección propia de indumentaria, con diseños originales inspirados en nuestra visión de la identidad, la historia y nuestra declaración de principios.
                </p>

                <p>
                  <strong className="text-white">PATRIA NOSTRA DISTRO</strong> está dirigido principalmente a quienes se sienten parte de esta escena y buscan música, e indumentaria que representen sus ideas.
                </p>

                <div className="pt-2">
                  <p className="text-neutral-200 font-semibold border-l-2 border-[#C52222] pl-4 py-1 italic bg-neutral-950/60">
                    "No somos una gran tienda ni una cadena comercial. Somos una distro independiente, construida desde la pasión por la música, el nacionalismo y la disidencia."
                  </p>
                </div>
              </div>

              {/* Llama de la Revolución Quote Box */}
              <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="font-condensed font-bold text-xs tracking-[0.2em] text-[#C52222] uppercase block">
                    DECLARACIÓN DE PRINCIPIOS
                  </span>
                  <span className="font-gothic text-2xl sm:text-3xl text-white mt-1 block">
                    Desde el 2018, Manteniendo viva la llama de la Revolución.
                  </span>
                  <span className="text-xs font-condensed tracking-widest text-neutral-400 uppercase mt-1 block font-bold">
                    PATRIA NOSTRA DISTRO.-
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/catalogo"
                className="btn-crimson font-condensed font-bold text-xs tracking-[0.2em] uppercase px-7 py-4 inline-flex items-center gap-2 shadow-xl cursor-pointer"
              >
                <span>VER CATÁLOGO & MÚSICA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                to="/contacto"
                className="font-condensed font-bold text-xs tracking-[0.2em] uppercase px-7 py-4 inline-flex items-center gap-2 border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <span>CONTACTAR A LA DISTRO</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Pillars & Identity */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Identity Badge Card */}
            <div className="bg-[#080808] border border-neutral-900 p-6 hard-box flex items-center gap-5">
              <div className="w-16 h-20 shrink-0">
                <img 
                  src="/logo.webp" 
                  alt="Escudo Patria Nostra" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(197,34,34,0.3)]"
                />
              </div>
              <div>
                <span className="text-[11px] font-condensed font-bold tracking-[0.2em] text-[#C52222] uppercase block">
                  DISTRO INDEPENDIENTE
                </span>
                <h3 className="font-condensed text-xl font-bold uppercase text-white tracking-wide">
                  PATRIA NOSTRA DISTRO
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-1">
                  Fundada en 2018 • Santiago de Chile 🇨🇱. Distribución nacional e internacional de material identitario.
                </p>
              </div>
            </div>

            {/* Pillar 1: Música y Ediciones Físicas */}
            <div className="bg-[#080808] border border-neutral-900 p-6 hard-box hover:border-neutral-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded bg-neutral-900 flex items-center justify-center text-[#C52222]">
                  <Disc className="w-5 h-5" />
                </div>
                <h4 className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                  MÚSICA & EDICIONES FÍSICAS
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                Difusión activa de bandas y solistas de la escena contestataria e identitaria. Catálogo físico disponible en vinilos, CDs, casetes y merchandising oficial.
              </p>
            </div>

            {/* Pillar 2: Colección Propia de Indumentaria */}
            <div className="bg-[#080808] border border-neutral-900 p-6 hard-box hover:border-neutral-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded bg-neutral-900 flex items-center justify-center text-[#C52222]">
                  <Shirt className="w-5 h-5" />
                </div>
                <h4 className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                  COLECCIÓN PROPIA & DISEÑOS EXCLUSIVOS
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                Prendas de alto gramaje con serigrafías resistentes e ilustraciones originales concebidas desde nuestra visión histórica, principios y convicción.
              </p>
            </div>

            {/* Pillar 3: Resistencia & Disidencia */}
            <div className="bg-[#080808] border border-neutral-900 p-6 hard-box hover:border-neutral-800 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded bg-neutral-900 flex items-center justify-center text-[#C52222]">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                  PASIÓN & DISIDENCIA
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                Sin concesiones al mercado tradicional ni a la moda rápida. Construido por y para quienes defienden sus raíces y sus ideales.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
