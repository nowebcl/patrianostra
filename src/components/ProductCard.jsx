import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../utils/currency';
import { sortSizes } from '../utils/sizes';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const rawSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const sizes = sortSizes(rawSizes);
  const sizeStock = product.sizeStock || {};

  // Primer talla disponible por defecto
  const defaultAvailableSize = sizes.find(sz => (sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 1) > 0) || sizes[0];
  const [selectedSize, setSelectedSize] = React.useState(defaultAvailableSize);

  // Actualizar talla por defecto si cambia el producto
  React.useEffect(() => {
    setSelectedSize(defaultAvailableSize);
  }, [product.id]);

  const currentSizeStock = sizeStock[selectedSize] !== undefined ? Number(sizeStock[selectedSize]) : (product.stock || 0);
  const isOutOfStock = currentSizeStock <= 0;

  return (
    <div className="product-card group relative flex flex-col justify-between p-3 sm:p-4 bg-[#080808] border border-neutral-900 transition-all duration-300 hover:border-neutral-700">
      
      {/* Limited Badge */}
      {product.badge && (
        <div className="absolute top-3 right-3 z-10">
          <span className="badge-limited">{product.badge}</span>
        </div>
      )}

      {/* Product Image Container (Direct link to Single Product page) */}
      <Link 
        to={`/producto/${product.id}`}
        className="relative w-full aspect-square bg-[#050505] flex items-center justify-center p-2 overflow-hidden mb-3 block"
      >
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/producto.webp';
          }}
          className="product-img w-full h-full object-contain filter contrast-105"
        />

        {/* Hover Action to view single product */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2">
          <span className="bg-black/90 text-white border border-neutral-600 px-4 py-2 text-xs font-condensed tracking-[0.18em] uppercase transition-colors">
            VER DETALLE →
          </span>
        </div>
      </Link>

      {/* Product Metadata */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <Link 
            to={`/producto/${product.id}`}
            className="font-condensed text-xs sm:text-sm font-semibold tracking-[0.15em] text-neutral-200 uppercase truncate hover:text-white transition-colors block"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-condensed text-xs sm:text-sm font-bold text-white">
              {formatCLP(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-condensed text-xs text-neutral-600 line-through">
                {formatCLP(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Size Selector */}
        <div className="mt-3 pt-2.5 border-t border-neutral-900/80">
          <div className="flex items-center justify-between mb-1.5 text-[10px] font-condensed tracking-wider uppercase">
            <span className="text-neutral-400">TALLA: <strong className="text-white">{selectedSize}</strong></span>
            <span className={isOutOfStock ? 'text-red-400 font-bold' : currentSizeStock <= 3 ? 'text-amber-400 font-bold' : 'text-neutral-500 font-mono'}>
              {isOutOfStock ? 'AGOTADA' : `${currentSizeStock} u.`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {sizes.map(sz => {
              const szStock = sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 1;
              const szOut = szStock <= 0;
              const isSelected = selectedSize === sz;

              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  disabled={szOut}
                  title={szOut ? `Talla ${sz} agotada` : `${szStock} disponibles`}
                  className={`min-w-[28px] py-0.5 px-1.5 text-[10px] font-condensed font-bold tracking-wider rounded transition-all text-center ${
                    szOut
                      ? 'bg-neutral-950 text-neutral-600 line-through cursor-not-allowed border border-neutral-900/60'
                      : isSelected
                        ? 'bg-[#C52222] text-white border border-[#C52222] shadow-[0_0_8px_rgba(197,34,34,0.3)] cursor-pointer'
                        : 'bg-[#111] hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button 
        type="button"
        disabled={isOutOfStock}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isOutOfStock) {
            addToCart(product.id, selectedSize, 1);
          }
        }}
        className={`mt-3 w-full py-2 text-[11px] font-condensed font-bold tracking-[0.15em] uppercase transition-all duration-200 ${
          isOutOfStock
            ? 'bg-neutral-950 border border-neutral-900 text-neutral-600 cursor-not-allowed'
            : 'bg-[#111111] hover:bg-[#C52222] text-neutral-300 hover:text-white border border-neutral-800 hover:border-[#C52222] cursor-pointer active:scale-95'
        }`}
      >
        {isOutOfStock ? `TALLA ${selectedSize} AGOTADA` : `AÑADIR TALLA ${selectedSize} +`}
      </button>

    </div>
  );
};
