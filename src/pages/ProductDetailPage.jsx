import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, ChevronRight, Check, Sparkles, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { formatCLP } from '../utils/currency';
import { sortSizes } from '../utils/sizes';
import { isClothingCategory, isMusicCategory } from '../lib/pocketbase';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useStore();
  const { addToCart, setIsCartOpen } = useCart();

  const product = products.find(p => p.id === id) || products[0] || {};
  const sizeStock = product.sizeStock || {};
  const rawSizes = Array.isArray(product.sizes) && product.sizes.length > 0 
    ? product.sizes 
    : (Object.keys(sizeStock).length > 0 ? Object.keys(sizeStock) : ['S', 'M', 'L', 'XL', 'XXL']);
  const sizes = sortSizes(rawSizes);

  const firstInStockSize = sizes.find(s => (sizeStock[s] ?? 1) > 0) || sizes[0] || 'L';

  const defaultColor = product.defaultColor || (product.colors && product.colors[0]) || 'Negro';
  const initialImg = (product.colorImages && product.colorImages[defaultColor]) || product.gallery?.[0] || product.image || '/producto.webp';

  const [activeImage, setActiveImage] = useState(initialImg);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(firstInStockSize);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);
  // Detección inteligente de prendas de vestir y música
  const isClothing = useMemo(() => {
    return isClothingCategory(product.category, sizes);
  }, [product.category, sizes]);

  const isMusic = useMemo(() => {
    return isMusicCategory(product.category);
  }, [product.category]);

  const [openAccordion, setOpenAccordion] = useState(isClothing ? 'specs' : 'shipping');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [activeImage]);

  useEffect(() => {
    if (product) {
      const initColor = product.defaultColor || (product.colors && product.colors[0]) || 'Negro';
      setSelectedColor(initColor);
      const initImg = (product.colorImages && product.colorImages[initColor]) || product.gallery?.[0] || product.image || '/producto.webp';
      setActiveImage(initImg);
      const inStock = sizes.find(s => (product.sizeStock?.[s] ?? 1) > 0) || sizes[0] || 'L';
      setSelectedSize(inStock);
      setQuantity(1);
      setOpenAccordion(isClothing ? 'specs' : 'shipping');
    }
  }, [product.id, isClothing]);

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    if (product.colorImages && product.colorImages[colorName]) {
      setActiveImage(product.colorImages[colorName]);
    }
  };

  const handleThumbnailClick = (img) => {
    setActiveImage(img);
    if (product.colorImages) {
      const matched = Object.entries(product.colorImages).find(([col, url]) => url === img);
      if (matched) {
        setSelectedColor(matched[0]);
      }
    }
  };

  const currentSizeStock = sizeStock[selectedSize] !== undefined 
    ? Number(sizeStock[selectedSize]) 
    : (product.stock !== undefined ? Number(product.stock) : 10);

  const isCurrentSizeOutOfStock = currentSizeStock <= 0;

  // Related products
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, quantity, selectedColor, activeImage);
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedSize, quantity, selectedColor, activeImage);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] font-condensed tracking-widest text-neutral-500 uppercase mb-8">
          <Link to="/" className="hover:text-white transition-colors">INICIO</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/catalogo" className="hover:text-white transition-colors">CATÁLOGO</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-300 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Master View Image */}
            <div className="relative aspect-square w-full bg-[#070707] border border-neutral-900 overflow-hidden flex items-center justify-center p-4">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#0c0c0c] flex items-center justify-center animate-pulse z-0">
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-800 border-t-[#C52222] animate-spin opacity-40" />
                </div>
              )}
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="badge-limited">{product.badge}</span>
                </div>
              )}
              <img 
                src={activeImage || product.image || '/producto.webp'} 
                alt={product.name}
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/producto.webp';
                  setImageLoaded(true);
                }}
                className={`w-full h-full object-contain filter contrast-105 transition-all duration-300 relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(img)}
                    className={`w-20 h-20 bg-[#070707] border p-1 shrink-0 transition-all cursor-pointer ${
                      activeImage === img ? 'border-[#C52222]' : 'border-neutral-900 hover:border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} vista ${idx + 1}`} 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/producto.webp'; }}
                      className="w-full h-full object-contain" 
                    />
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
              <span className="font-condensed text-2xl sm:text-3xl font-extrabold text-white">
                {formatCLP(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-condensed text-base text-neutral-600 line-through">
                  {formatCLP(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-neutral-400 font-sans ml-auto">
                3 cuotas de <strong className="text-white">{formatCLP(product.price / 3)}</strong> sin interés
              </span>
            </div>

            {/* Stock Alert */}
            {product.stock !== undefined && (
              <div className={`border p-2.5 mb-6 flex items-center gap-2 ${
                isCurrentSizeOutOfStock 
                  ? 'bg-[#180808] border-red-900/60 text-red-400' 
                  : currentSizeStock <= 3 
                    ? 'bg-[#161005] border-amber-800/60 text-amber-300'
                    : 'bg-[#110A0A] border-[#C52222]/30 text-neutral-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-[#C52222] shrink-0" />
                <span className="text-[11px] font-condensed font-bold tracking-wider uppercase">
                  {isCurrentSizeOutOfStock ? (
                    <span className="text-red-400 font-bold">
                      {isClothing ? `TALLA ${selectedSize} AGOTADA — Elige otra talla disponible` : 'PRODUCTO AGOTADO — Sin stock disponible'}
                    </span>
                  ) : currentSizeStock <= 3 ? (
                    <span>
                      ¡ÚLTIMAS UNIDADES! QUEDAN SOLO <strong className="text-amber-400">{currentSizeStock} {isClothing ? 'PRENDAS' : 'COPIAS'}</strong> {isClothing ? `EN TALLA ${selectedSize}` : 'DISPONIBLES'}
                    </span>
                  ) : (
                    <span>
                      DISPONIBILIDAD {isClothing ? `TALLA ${selectedSize}:` : ':'} <strong className="text-emerald-400 font-bold">{currentSizeStock} UNIDADES</strong> EN STOCK
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mb-6 space-y-3">
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {product.description}
              </p>
              
              {isClothing && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#140b0b] border border-[#C52222]/40 rounded-lg text-xs font-condensed font-bold tracking-wider text-neutral-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#C52222] shrink-0" />
                  <span>ESTAMPADOS EN DTF DE ALTA CALIDAD, RESISTENTES E ILUSTRACIONES DE MÁXIMA DEFINICIÓN</span>
                </div>
              )}
            </div>

            {/* Color Selector: Solo para prendas de vestir con variantes de color */}
            {isClothing && product.colors && product.colors.length > 0 && (
              <div className="mb-6 bg-[#0a0a0a] border border-neutral-850 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-condensed font-bold tracking-wider text-neutral-300 uppercase flex items-center gap-2">
                    <span>COLOR DE LA PRENDA:</span>
                    <strong className="text-white text-sm bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded tracking-widest">{selectedColor}</strong>
                  </span>
                  <span className="text-[10px] font-condensed tracking-wider text-neutral-400 uppercase">
                    {product.colors.length} {product.colors.length === 1 ? 'COLOR DISPONIBLE' : 'COLORES DISPONIBLES'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(colorName => {
                    const isSelected = selectedColor === colorName;
                    const colorItem = product.colorItems?.find(c => c.name === colorName);
                    const hex = colorItem?.hex || (colorName.toLowerCase().includes('blanco') ? '#FFFFFF' : '#111111');
                    const colorImg = product.colorImages?.[colorName];

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => handleColorChange(colorName)}
                        className={`group/btn relative py-2 px-3 text-xs font-condensed font-bold tracking-wider transition-all uppercase flex items-center gap-2.5 cursor-pointer rounded-lg ${
                          isSelected
                            ? 'bg-[#161616] border-2 border-[#C52222] text-white shadow-[0_0_12px_rgba(197,34,34,0.35)] scale-[1.02]'
                            : 'bg-[#111] border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-neutral-700/80 shrink-0 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: hex }}
                        >
                          {isSelected && hex === '#FFFFFF' && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                        </span>
                        <span>{colorName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C52222] ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size / Format Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-condensed font-bold tracking-wider text-neutral-300 uppercase">
                    {sizes.length === 1 && sizes[0] === 'Única' ? 'FORMATO / EDICIÓN:' : 'SELECCIONAR TALLA:'}
                  </span>
                  {isClothing && (
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-condensed font-bold tracking-wider text-[#C52222] hover:text-white transition-colors cursor-pointer ml-1.5 group"
                    >
                      <Ruler className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="underline decoration-[#C52222]/60 underline-offset-4">GUÍA DE TALLAS</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-condensed tracking-wider text-neutral-500 uppercase">
                  {sizes.length === 1 && sizes[0] === 'Única' ? (product.category || 'EDICIÓN OFICIAL').toUpperCase() : `CORTE ${(product.fit || 'Regular').toUpperCase()}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map(sz => {
                  const stockForSz = sizeStock[sz] !== undefined ? Number(sizeStock[sz]) : 1;
                  const isOutOfStock = stockForSz <= 0;
                  const isLow = stockForSz > 0 && stockForSz <= 3;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(sz);
                        setQuantity(1);
                      }}
                      className={`relative min-w-[62px] py-2 px-3 text-xs font-condensed font-bold tracking-wider transition-all uppercase flex flex-col items-center justify-center ${
                        isOutOfStock
                          ? 'bg-[#0a0a0a] border border-neutral-900 text-neutral-600 cursor-not-allowed opacity-50 line-through'
                          : isSelected
                            ? 'bg-[#C52222] text-white border border-[#C52222] shadow-[0_0_12px_rgba(197,34,34,0.4)] cursor-pointer'
                            : 'bg-[#080808] border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white cursor-pointer'
                      }`}
                    >
                      <span className="text-sm leading-tight">{sz}</span>
                      <span className={`text-[9px] font-mono tracking-tighter mt-0.5 ${
                        isOutOfStock 
                          ? 'text-neutral-600' 
                          : isSelected 
                            ? 'text-white/90 font-bold'
                            : isLow 
                              ? 'text-amber-400' 
                              : 'text-neutral-500'
                      }`}>
                        {isOutOfStock ? '0 u.' : `${stockForSz} u.`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add Actions */}
            <div className="flex items-center gap-3 mb-4">
              
              {/* Quantity Box */}
              <div className="flex items-center border border-neutral-800 bg-[#080808] h-12">
                <button 
                  type="button"
                  disabled={isCurrentSizeOutOfStock}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 text-neutral-400 hover:text-white text-sm font-mono cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-bold text-white">
                  {isCurrentSizeOutOfStock ? 0 : quantity}
                </span>
                <button 
                  type="button"
                  disabled={isCurrentSizeOutOfStock || quantity >= currentSizeStock}
                  onClick={() => setQuantity(q => Math.min(currentSizeStock, q + 1))}
                  className="px-3 text-neutral-400 hover:text-white text-sm font-mono cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={isCurrentSizeOutOfStock}
                className={`flex-1 font-condensed font-bold text-xs sm:text-sm tracking-[0.2em] uppercase h-12 border transition-all flex items-center justify-center gap-2 ${
                  isCurrentSizeOutOfStock
                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                    : 'bg-[#161616] hover:bg-[#C52222] text-white border-neutral-700 hover:border-[#C52222] cursor-pointer active:scale-98'
                }`}
              >
                <span>{isCurrentSizeOutOfStock ? 'TALLA AGOTADA' : 'AÑADIR AL CARRITO'}</span>
                {!isCurrentSizeOutOfStock && <span>+</span>}
              </button>

            </div>

            {/* Direct Buy Now Button */}
            <button 
              type="button"
              onClick={handleBuyNow}
              disabled={isCurrentSizeOutOfStock}
              className={`w-full font-condensed font-bold text-xs sm:text-sm tracking-[0.2em] uppercase h-12 transition-all flex items-center justify-center gap-2 mb-8 ${
                isCurrentSizeOutOfStock
                  ? 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed shadow-none'
                  : 'bg-[#9E1B1B] hover:bg-[#C52222] text-white shadow-lg glow-red-sm cursor-pointer active:scale-98'
              }`}
            >
              <span>{isCurrentSizeOutOfStock ? 'SELECCIONA OTRA TALLA' : 'COMPRAR AHORA'}</span>
              {!isCurrentSizeOutOfStock && <span>→</span>}
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
              
              {/* Specs: Solo para prendas de vestir */}
              {isClothing && (
                <div>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                    className="w-full p-3.5 text-left text-xs font-condensed font-bold tracking-wider uppercase text-neutral-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>ESPECIFICACIONES DE FABRICACIÓN</span>
                    <span>{openAccordion === 'specs' ? '−' : '+'}</span>
                  </button>
                  {openAccordion === 'specs' && (
                    <div className="p-3.5 pt-0 text-xs text-neutral-400 font-sans space-y-2 border-t border-neutral-900/50">
                      <div className="flex items-start gap-2 text-neutral-200">
                        <span className="text-[#C52222] font-bold">✓</span>
                        <span><strong>Estampado Textil:</strong> Estampados en DTF de alta calidad, resistentes e ilustraciones originales concebidas con máxima fidelidad, elasticidad y durabilidad ante lavados continuos.</span>
                      </div>
                      {product.specs?.map((spec, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#C52222] font-bold">✓</span>
                          <span>{spec}</span>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="w-full mt-2 pt-2 border-t border-neutral-900/80 flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-[#C52222]" />
                          <span>Medidas: Consulta la <strong>Guía de Tallas Oficial</strong> (ancho y largo)</span>
                        </span>
                        <span className="text-[#C52222] text-[11px] font-condensed font-bold uppercase underline">Ver Tabla Oficial →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                  <div className="p-3.5 pt-0 text-xs text-neutral-300 font-sans leading-relaxed border-t border-neutral-900/50">
                    Todos los pedidos se despachan después de 24/48 horas laborales. Agencia a convenir por el comprador.
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

        {/* Size Guide Modal Oficial */}
        <SizeGuideModal 
          isOpen={isSizeGuideOpen} 
          onClose={() => setIsSizeGuideOpen(false)} 
          currentSelectedSize={selectedSize} 
        />

      </div>
    </div>
  );
};
