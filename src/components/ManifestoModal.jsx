import React from 'react';
import { X } from 'lucide-react';
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
          aria-label="Cerrar manifiesto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-[#C52222] font-condensed font-bold tracking-[0.25em] text-xs uppercase block mb-1">
            MANIFIESTO OFICIAL
          </span>
          <h2 className="font-gothic text-4xl text-neutral-100 mb-2">patria nostra</h2>
          <div className="w-12 h-0.5 bg-[#C52222] mx-auto"></div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed text-justify">
          <p>
            <strong className="text-white">Patria Nostra</strong> no es una marca para las masas ni una etiqueta de consumo efímero. Es un pacto de lealtad con nuestras raíces, con la música contestataria y con la historia de aquellos que nunca bajaron los brazos.
          </p>
          <p>
            Rechazamos las tendencias vacías y los ciclos de moda rápida. Cada una de nuestras piezas es fabricada en lotes estrictamente limitados con tejidos de gramaje superior y serigrafías al agua que resisten el paso del tiempo y el asfalto.
          </p>
          <p>
            Nuestras colaboraciones con bandas como <em className="text-[#C52222]">Kronstadt</em>, <em className="text-[#C52222]">Bastión</em> y <em className="text-[#C52222]">Disidencia</em> nacen de la hermandad en el foso, en el escenario y en las calles.
          </p>
          <div className="border-t border-neutral-800 pt-4 mt-6 text-center">
            <span className="font-condensed font-bold text-xs tracking-[0.2em] text-[#C52222] uppercase">
              HONOR • LEALTAD • RESISTENCIA
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
