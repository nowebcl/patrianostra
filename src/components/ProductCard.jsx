import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../utils/currency';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

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
        className="relative w-full aspect-square bg-[#050505] flex items-center justify-center p-2 overflow-hidden mb-4 block"
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-img w-full h-full object-contain filter contrast-105"
        />

        {/* Hover Action to view single product */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2">
          <span className="bg-black/90 text-white border border-neutral-600 px-4 py-2 text-xs font-condensed tracking-[0.18em] uppercase transition-colors">
            VER PRENDA →
          </span>
        </div>
      </Link>

      {/* Product Metadata */}
      <div className="flex flex-col">
        <Link 
          to={`/producto/${product.id}`}
          className="font-condensed text-xs sm:text-sm font-semibold tracking-[0.15em] text-neutral-200 uppercase truncate hover:text-white transition-colors"
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

      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToCart(product.id, 'L', 1);
        }}
        className="mt-3 w-full bg-[#111111] hover:bg-[#C52222] text-neutral-300 hover:text-white border border-neutral-800 hover:border-[#C52222] py-2 text-[11px] font-condensed font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer active:scale-95"
      >
        AÑADIR AL CARRITO +
      </button>

    </div>
  );
};
