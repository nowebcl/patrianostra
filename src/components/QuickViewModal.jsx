import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../utils/currency';
import { sortSizes } from '../utils/sizes';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  
  const sizeStock = quickViewProduct?.sizeStock || {};
  const rawSizes = Array.isArray(quickViewProduct?.sizes) && quickViewProduct.sizes.length > 0
    ? quickViewProduct.sizes
    : (Object.keys(sizeStock).length > 0 ? Object.keys(sizeStock) : ['S', 'M', 'L', 'XL', 'XXL']);
  const sizes = sortSizes(rawSizes);

  const firstInStock = sizes.find(s => (sizeStock[s] ?? 1) > 0) || sizes[0] || 'L';
  const colors = quickViewProduct?.colors || [];
  const defaultColor = quickViewProduct?.defaultColor || colors[0] || 'Negro';

  const [selectedSize, setSelectedSize] = useState(firstInStock);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [activeImage, setActiveImage] = useState(quickViewProduct?.colorImages?.[defaultColor] || quickViewProduct?.image || '/producto.webp');

  React.useEffect(() => {
    if (quickViewProduct) {
      const initColor = quickViewProduct.defaultColor || (quickViewProduct.colors && quickViewProduct.colors[0]) || 'Negro';
      setSelectedColor(initColor);
      setActiveImage(quickViewProduct.colorImages?.[initColor] || quickViewProduct.image || '/producto.webp');
      const inStock = sizes.find(s => (quickViewProduct.sizeStock?.[s] ?? 1) > 0) || sizes[0] || 'L';
      setSelectedSize(inStock);
    }
  }, [quickViewProduct?.id, quickViewProduct?.image, quickViewProduct?.colorImages]);

  if (!quickViewProduct) return null;

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    const target = quickViewProduct.colorImages?.[colorName] || quickViewProduct.image || '/producto.webp';
    setActiveImage(target);
  };

  const currentSizeStock = sizeStock[selectedSize] !== undefined 
    ? Number(sizeStock[selectedSize]) 
    : (quickViewProduct.stock || 0);

  const isCurrentOutOfStock = currentSizeStock <= 0;

  const handleAddToCart = () => {
    if (isCurrentOutOfStock) return;
    addToCart(quickViewProduct.id, selectedSize, 1, selectedColor, activeImage);
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
          <div className="relative aspect-square bg-[#050505] border border-neutral-900 p-4 flex items-center justify-center overflow-hidden">
            {quickViewProduct.badge && (
              <span className="badge-limited absolute top-3 right-3">{quickViewProduct.badge}</span>
            )}
            <img 
              src={activeImage || quickViewProduct.image || '/producto.webp'} 
              alt={quickViewProduct.name} 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/producto.webp'; }}
              className="w-full h-full object-contain filter contrast-105 transition-all duration-300" 
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
            <span className="font-condensed text-lg font-bold text-neutral-200 mt-1 mb-3">
              {formatCLP(quickViewProduct.price)}
            </span>

            {/* Stock indicator */}
            <div className="mb-4">
              <span className={`text-[10px] font-condensed font-bold uppercase tracking-wider ${
                isCurrentOutOfStock ? 'text-red-400' : currentSizeStock <= 3 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {isCurrentOutOfStock ? `● Talla ${selectedSize} agotada` : currentSizeStock <= 3 ? `▲ ¡Últimas ${currentSizeStock} en talla ${selectedSize}!` : `✓ ${currentSizeStock} disponibles en talla ${selectedSize}`}
              </span>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-5 line-clamp-3">
              {quickViewProduct.description}
            </p>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <span className="text-[11px] font-condensed font-semibold tracking-wider text-neutral-400 uppercase block mb-2">
                  COLOR: <strong className="text-white ml-1">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {colors.map(colorName => {
                    const isSelected = selectedColor === colorName;
                    const item = quickViewProduct.colorItems?.find(ci => ci.name === colorName);
                    const hex = item?.hex || (colorName.toLowerCase().includes('blanco') ? '#FFFFFF' : '#111111');

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => handleColorChange(colorName)}
                        className={`px-3 py-1.5 border text-xs font-condensed font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-[#C52222] bg-[#1a1a1a] text-white shadow-md ring-1 ring-[#C52222]'
                            : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-black'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-neutral-700/80 shrink-0" 
                          style={{ backgroundColor: hex }} 
                        />
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="mb-6">
              <span className="text-[11px] font-condensed font-semibold tracking-wider text-neutral-400 uppercase block mb-2">
                SELECCIONAR TALLA:
              </span>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const stockForSz = sizeStock[size] !== undefined ? Number(sizeStock[size]) : 1;
                  const isOut = stockForSz <= 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOut}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 border text-xs font-condensed font-semibold tracking-wider transition-all flex flex-col items-center ${
                        isOut
                          ? 'border-neutral-900 bg-neutral-950 text-neutral-600 line-through cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'border-[#C52222] bg-[#C52222] text-white shadow-md cursor-pointer'
                            : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 cursor-pointer'
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-[8px] font-mono opacity-80">{isOut ? '0' : stockForSz} u.</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Button */}
            <button 
              type="button"
              disabled={isCurrentOutOfStock}
              onClick={handleAddToCart}
              className={`w-full font-condensed font-bold text-xs tracking-[0.2em] uppercase py-3 transition-all hard-box ${
                isCurrentOutOfStock
                  ? 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                  : 'bg-[#9E1B1B] hover:bg-[#C52222] text-white glow-red-sm cursor-pointer'
              }`}
            >
              {isCurrentOutOfStock ? 'TALLA AGOTADA' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
