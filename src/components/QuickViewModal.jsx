import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../utils/currency';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('L');

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    addToCart(quickViewProduct.id, selectedSize, 1);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-black border border-neutral-800 shadow-2xl p-6 hard-box">
        
        {/* Close Button */}
        <button 
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 cursor-pointer" 
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="relative aspect-square bg-[#050505] border border-neutral-900 p-4 flex items-center justify-center">
            {quickViewProduct.badge && (
              <span className="badge-limited absolute top-3 right-3">{quickViewProduct.badge}</span>
            )}
            <img 
              src={quickViewProduct.image} 
              alt={quickViewProduct.name} 
              className="w-full h-full object-contain filter contrast-105" 
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-[#C52222] font-condensed text-xs font-bold tracking-[0.2em] uppercase mb-1">
              EDICIÓN LIMITADA
            </span>
            <h3 className="font-condensed text-xl font-bold tracking-wider text-neutral-100 uppercase">
              {quickViewProduct.name}
            </h3>
            <span className="font-condensed text-lg font-bold text-neutral-200 mt-1 mb-4">
              {formatCLP(quickViewProduct.price)}
            </span>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-6">
              {quickViewProduct.description}
            </p>

            {/* Sizes */}
            <div className="mb-6">
              <span className="text-[11px] font-condensed font-semibold tracking-wider text-neutral-400 uppercase block mb-2">
                SELECCIONAR TALLA:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 border text-xs font-condensed font-semibold tracking-wider transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-red-600 bg-red-600/20 text-white'
                        : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Button */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#9E1B1B] hover:bg-[#C52222] text-white font-condensed font-bold text-xs tracking-[0.2em] uppercase py-3 transition-all hard-box glow-red-sm cursor-pointer"
            >
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
