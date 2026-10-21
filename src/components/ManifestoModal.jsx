import React from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ManifestoModal = () => {
  const { isManifestoOpen, setIsManifestoOpen } = useCart();

  if (!isManifestoOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-black border border-neutral-800 shadow-2xl p-6 sm:p-8 hard-box max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsManifestoOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer" 
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs uppercase block mb-1">
            QUIÉNES SOMOS • MANIFIESTO OFICIAL
          </span>
          <h2 className="font-gothic text-4xl text-neutral-100 mb-2">patria nostra distro</h2>
          <div className="w-12 h-0.5 bg-[#C52222] mx-auto"></div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed text-justify">
          <p>
            <strong className="text-white">PATRIA NOSTRA DISTRO</strong> nace en 2018 como un proyecto independiente dedicado a la difusión y venta de música, indumentaria y material relacionado con bandas y artistas de la escena nacionalista, patriota e identitaria.
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
          <p className="border-l-2 border-[#C52222] pl-3 py-1 italic text-neutral-200 bg-neutral-950">
            No somos una gran tienda ni una cadena comercial. Somos una distro independiente, construida desde la pasión por la música, el nacionalismo y la disidencia.
          </p>

          <div className="border-t border-neutral-800 pt-4 mt-6 text-center space-y-2">
            <span className="font-condensed font-bold text-xs tracking-[0.2em] text-[#C52222] uppercase block">
              DESDE EL 2018, MANTENIENDO VIVA LA LLAMA DE LA REVOLUCIÓN.
            </span>
            <span className="font-condensed font-bold text-[11px] tracking-[0.25em] text-neutral-400 uppercase block">
              PATRIA NOSTRA DISTRO.-
            </span>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/quienes-somos"
              onClick={() => setIsManifestoOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-condensed font-bold tracking-wider text-neutral-300 hover:text-white border-b border-neutral-700 hover:border-white pb-0.5 transition-colors"
            >
              <span>CONOCER MÁS EN LA PÁGINA QUIÉNES SOMOS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
