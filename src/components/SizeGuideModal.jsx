import React, { useEffect } from 'react';
import { X, Ruler, Download, Check, Sparkles, ExternalLink } from 'lucide-react';

export const SIZE_TABLE_DATA = [
  { size: 'S', us: 'S', width: '47 cm', length: '70 cm' },
  { size: 'M', us: 'M', width: '52 cm', length: '72 cm' },
  { size: 'L', us: 'L', width: '57 cm', length: '74 cm' },
  { size: 'XL', us: 'XL', width: '61 cm', length: '76 cm' },
  { size: '2XL', us: '2XL', width: '65 cm', length: '80 cm' },
  { size: 'XXL', us: '2XL', width: '65 cm', length: '80 cm' }
];

export const SizeGuideModal = ({ isOpen, onClose, currentSelectedSize = 'L' }) => {
  // Manejo de tecla ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de la página al abrir
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedCurrent = currentSelectedSize?.toUpperCase?.() || 'L';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] p-4 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#C52222]/30 flex items-center justify-center text-[#C52222]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-condensed font-bold tracking-[0.25em] text-[#C52222] uppercase">
                  PATRIA NOSTRA DISTRO
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded">
                  TABLA OFICIAL
                </span>
              </div>
              <h2 className="font-condensed text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                GUÍA DE TALLAS — CAMISETAS &amp; POLERAS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#141414] hover:bg-[#C52222] text-neutral-400 hover:text-white border border-neutral-800 hover:border-[#C52222] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Visual Column: Official Size Guide Graphic */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-black border border-neutral-800/90 rounded-lg p-3 sm:p-4 flex items-center justify-center relative group">
              <picture>
                <source srcSet="/images/guia-de-tallas.webp" type="image/webp" />
                <source srcSet="/guia-de-tallas.webp" type="image/webp" />
                <img 
                  src="/images/guia-de-tallas.png" 
                  alt="Guía de Tallas Camiseta Patria Nostra" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/guia-de-tallas.png';
                  }}
                  className="max-h-[480px] w-auto object-contain rounded drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter contrast-105"
                />
              </picture>

              <a
                href="/images/guia-de-tallas.png"
                target="_blank"
                rel="noopener noreferrer"
                download="Guia_Tallas_Patria_Nostra.png"
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-neutral-900/90 hover:bg-[#C52222] text-white border border-neutral-700 hover:border-[#C52222] text-[10px] font-condensed uppercase tracking-wider rounded backdrop-blur-sm flex items-center gap-1.5 transition-all opacity-80 hover:opacity-100"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Guía</span>
              </a>
            </div>
            
            <p className="text-[11px] text-neutral-500 font-sans mt-2.5 text-center">
              * Medidas expresadas en centímetros tomadas con la prenda en plano. Margen de tolerancia ± 1,2 cm.
            </p>
          </div>

          {/* Measurements & Table Column */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            
            {/* Cómo medir */}
            <div className="bg-[#111111] border border-neutral-850 p-4 rounded-lg space-y-2">
              <span className="text-[11px] font-condensed font-bold tracking-wider text-neutral-300 uppercase block">
                ¿CÓMO MEDIR TU PRENDA FAVORITA?
              </span>
              <ul className="text-xs text-neutral-400 font-sans space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">A</span>
                  <span><strong>Ancho (Pecho):</strong> Mide de sisa a sisa (costura a costura) en la parte más ancha del pecho.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">B</span>
                  <span><strong>Largo Total:</strong> Mide verticalmente desde la unión del cuello y hombro hasta el dobladillo inferior.</span>
                </li>
              </ul>
            </div>

            {/* Interactive Measurements Table */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#151515] border-b border-neutral-800 text-[11px] font-condensed tracking-wider uppercase text-neutral-300">
                    <th className="py-2.5 px-3">Talla (US)</th>
                    <th className="py-2.5 px-3">Ancho (A)</th>
                    <th className="py-2.5 px-3">Largo (B)</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-xs font-sans">
                  {[
                    { size: 'S', width: '47 cm', length: '70 cm' },
                    { size: 'M', width: '52 cm', length: '72 cm' },
                    { size: 'L', width: '57 cm', length: '74 cm' },
                    { size: 'XL', width: '61 cm', length: '76 cm' },
                    { size: '2XL', width: '65 cm', length: '80 cm' }
                  ].map((row) => {
                    const isSelected = normalizedCurrent === row.size || (row.size === '2XL' && normalizedCurrent === 'XXL');
                    return (
                      <tr 
                        key={row.size}
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-[#C52222]/15 text-white font-medium border-l-2 border-l-[#C52222]' 
                            : 'hover:bg-neutral-900/60 text-neutral-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-condensed font-bold text-sm tracking-wider">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            isSelected ? 'bg-[#C52222] text-white' : 'bg-neutral-900 text-neutral-200'
                          }`}>
                            {row.size}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.width}</td>
                        <td className="py-2.5 px-3 font-mono">{row.length}</td>
                        <td className="py-2.5 px-3 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-condensed tracking-wider uppercase text-[#C52222] font-bold">
                              <Check className="w-3.5 h-3.5" /> Tu Talla
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-condensed uppercase tracking-wider">
                              Estándar
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quality & DTF Fabric Note */}
            <div className="bg-[#160c0c] border border-[#C52222]/30 rounded-lg p-3.5 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C52222] shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 font-sans space-y-1">
                <span className="font-condensed font-bold uppercase text-white tracking-wide block">
                  ESTAMPADO EN DTF DE ALTA CALIDAD &amp; TEJIDO PESADO
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Confección en 100% algodón peinado 240 GSM con costuras dobles reforzadas. El estampado en <strong>DTF de alta calidad</strong> garantiza máxima resistencia a los lavados sin cuartearse ni perder definición en sus ilustraciones originales.
                </p>
              </div>
            </div>

            {/* Fit Tip */}
            <div className="p-3 bg-[#0d0d0d] border border-neutral-850 rounded-lg text-xs text-neutral-400 font-sans leading-relaxed">
              💡 <strong>Consejo de Calce:</strong> Nuestras prendas poseen un calce clásico estructurado (regular fit). Si buscas un look oversize más amplio o relajado, te recomendamos optar por una talla adicional.
            </div>

          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500 font-sans text-center sm:text-left">
            ¿Tienes dudas con tu talla? Escríbenos a <strong className="text-neutral-300">contacto@patrianostradistro.cl</strong>
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#C52222] hover:bg-red-700 text-white font-condensed font-bold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer"
          >
            ENTENDIDO, VOLVER A LA PRENDA
          </button>
        </div>

      </div>
    </div>
  );
};
