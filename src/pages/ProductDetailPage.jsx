import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, ChevronRight, Check, Sparkles } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const product = products.find(p => p.id === id) || products[0];

  const [activeImage, setActiveImage] = useState(product.gallery?.[0] || product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('specs');

  // Related products
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedSize, quantity);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] font-condensed tracking-widest text-neutral-500 uppercase mb-8">
          <Link to="/" className="hover:text-white transition-colors">INICIO</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/catalogo" className="hover:text-white transition-colors">INDUMENTARIA</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-300 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Master View Image */}
            <div className="relative aspect-square w-full bg-[#070707] border border-neutral-900 overflow-hidden flex items-center justify-center p-4">
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="badge-limited">{product.badge}</span>
                </div>
              )}
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain filter contrast-105 transition-all duration-300"
              />
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 bg-[#070707] border p-1 shrink-0 transition-all cursor-pointer ${
                      activeImage === img ? 'border-[#C52222]' : 'border-neutral-900 hover:border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} vista ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Details, Specs & Buying Actions */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* Category & Slogan */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#C52222] font-condensed font-bold tracking-[0.2em] text-xs uppercase">
                {product.category}
              </span>
              <span className="text-neutral-700">•</span>
              <span className="text-neutral-500 font-condensed text-xs uppercase tracking-wider">
                {product.gsm}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-condensed text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white mb-3">
              {product.name}
            </h1>

            {/* Price & Installments */}
            <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-neutral-900">
              <span className="font-condensed text-2xl sm:text-3xl font-bold text-white">
                €{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-condensed text-base text-neutral-600 line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-neutral-400 font-sans ml-auto">
                3 cuotas de <strong className="text-white">€{(product.price / 3).toFixed(2)}</strong> sin interés
              </span>
            </div>

            {/* Stock Alert */}
            {product.stock && (
              <div className="bg-[#110A0A] border border-[#C52222]/30 p-2.5 mb-6 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C52222] shrink-0" />
                <span className="text-[11px] font-condensed font-bold tracking-wider text-neutral-300 uppercase">
                  DROP EXCLUSIVO: QUEDAN SOLO <span className="text-[#C52222]">{product.stock} UNIDADES</span> EN STOCK
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-condensed font-bold tracking-wider text-neutral-300 uppercase">
                  SELECCIONAR TALLA:
                </span>
                <span className="text-[10px] font-condensed tracking-wider text-neutral-500 uppercase">
                  CORTE {product.fit.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] py-2.5 px-3 text-xs font-condensed font-bold tracking-wider transition-all uppercase cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-[#C52222] text-white border border-[#C52222] shadow-[0_0_12px_rgba(197,34,34,0.4)]'
                        : 'bg-[#080808] border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add Actions */}
            <div className="flex items-center gap-3 mb-4">
              
              {/* Quantity Box */}
              <div className="flex items-center border border-neutral-800 bg-[#080808] h-12">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 text-neutral-400 hover:text-white text-sm font-mono cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-bold text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 text-neutral-400 hover:text-white text-sm font-mono cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#161616] hover:bg-[#C52222] text-white font-condensed font-bold text-xs sm:text-sm tracking-[0.2em] uppercase h-12 border border-neutral-700 hover:border-[#C52222] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>AÑADIR AL CARRITO</span>
                <span>+</span>
              </button>

            </div>

            {/* Direct Buy Now Button */}
            <button 
              onClick={handleBuyNow}
              className="w-full bg-[#9E1B1B] hover:bg-[#C52222] text-white font-condensed font-bold text-xs sm:text-sm tracking-[0.2em] uppercase h-12 transition-all flex items-center justify-center gap-2 mb-8 shadow-lg glow-red-sm cursor-pointer active:scale-98"
            >
              <span>COMPRAR AHORA</span>
              <span>→</span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-900 mb-6 text-[10px] font-condensed tracking-wider text-neutral-400 uppercase text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-neutral-500" />
                <span>ENVÍO 24/48H</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#C52222]" />
                <span>PAGO 100% SEGURO</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-neutral-500" />
                <span>CAMBIOS GRATIS</span>
              </div>
            </div>

            {/* Accordion Specs & Policies */}
            <div className="border border-neutral-900 divide-y divide-neutral-900 bg-[#080808]">
              
              {/* Specs */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                  className="w-full p-3.5 text-left text-xs font-condensed font-bold tracking-wider uppercase text-neutral-200 flex items-center justify-between cursor-pointer"
                >
                  <span>ESPECIFICACIONES DE FABRICACIÓN</span>
                  <span>{openAccordion === 'specs' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'specs' && (
                  <div className="p-3.5 pt-0 text-xs text-neutral-400 font-sans space-y-1.5 border-t border-neutral-900/50">
                    {product.specs?.map((spec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#C52222] font-bold">✓</span>
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full p-3.5 text-left text-xs font-condensed font-bold tracking-wider uppercase text-neutral-200 flex items-center justify-between cursor-pointer"
                >
                  <span>ENVÍOS Y ENTREGAS</span>
                  <span>{openAccordion === 'shipping' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="p-3.5 pt-0 text-xs text-neutral-400 font-sans leading-relaxed border-t border-neutral-900/50">
                    Todos los pedidos se despachan en embalaje ecológico sellado con precinto de seguridad. Envíos nacionales en 24/48 horas laborables. Envíos internacionales con seguimiento en tiempo real vía DHL Express.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Related Products */}
        <div className="border-t border-neutral-900 pt-12">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-neutral-900">
            <h2 className="font-condensed text-xl font-bold tracking-[0.2em] uppercase text-neutral-200">
              COMPLETA TU LOOK
            </h2>
            <Link to="/catalogo" className="text-xs font-condensed font-semibold tracking-wider text-neutral-400 hover:text-white uppercase">
              VER CATÁLOGO COMPLETO →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
