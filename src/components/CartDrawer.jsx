import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Tag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    discountAmount, 
    appliedCoupon, 
    couponDiscountPercent,
    applyCoupon, 
    removeCoupon,
    shippingCost,
    finalTotal,
    totalItems 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [showCouponField, setShowCouponField] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 80;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-black border-l border-neutral-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Cart Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-condensed text-lg font-bold tracking-[0.15em] text-neutral-200 uppercase">
              CARRITO DE COMPRAS
            </h3>
            <span className="bg-[#C52222] text-white text-xs font-condensed font-bold px-2 py-0.5">
              {totalItems}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-neutral-400 hover:text-white p-1 cursor-pointer" 
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {cart.length > 0 && (
          <div className="bg-[#080808] border-b border-neutral-900 px-5 py-3 text-xs font-condensed tracking-wider uppercase">
            <div className="flex items-center justify-between mb-1.5 text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C52222]" />
                {remainingForFreeShipping === 0 ? (
                  <strong className="text-emerald-400">¡ENVÍO GRATIS DESBLOQUEADO! 🇨🇱</strong>
                ) : (
                  <span>AÑADE <strong>€{remainingForFreeShipping.toFixed(2)}</strong> PARA ENVÍO GRATIS</span>
                )}
              </span>
              <span className="text-neutral-500 font-mono">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C52222] transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Cart Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="font-condensed text-sm font-semibold tracking-wider text-neutral-400 uppercase">Tu carrito está vacío</p>
              <p className="text-xs text-neutral-600 mt-1">Explora nuestro catálogo para añadir prendas.</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/catalogo');
                }}
                className="mt-4 px-6 py-2.5 bg-[#111111] hover:bg-[#C52222] text-neutral-200 hover:text-white border border-neutral-800 text-xs font-condensed tracking-widest uppercase transition-all"
              >
                IR AL CATÁLOGO →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.size}-${index}`} className="flex items-center gap-4 py-3 border-b border-neutral-800">
                  <div className="w-16 h-16 bg-neutral-950 border border-neutral-900 flex items-center justify-center p-1 shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-condensed text-sm font-semibold tracking-wider text-neutral-200 truncate uppercase">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Talla: <span className="text-neutral-200 font-semibold">{item.size}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-800">
                        <button 
                          onClick={() => updateQuantity(index, -1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs text-neutral-200 font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-neutral-200">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-neutral-500 hover:text-red-500 p-1 transition-colors cursor-pointer" 
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Coupon Form */}
              <div className="pt-2">
                {!showCouponField && !appliedCoupon && (
                  <button 
                    onClick={() => setShowCouponField(true)}
                    className="text-[11px] font-condensed tracking-wider text-neutral-400 hover:text-white flex items-center gap-1.5 uppercase cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-[#C52222]" />
                    <span>¿TIENES UN CÓDIGO DE DESCUENTO?</span>
                  </button>
                )}

                {showCouponField && !appliedCoupon && (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="CÓDIGO (EJ: PATRIA10)"
                      className="flex-1 bg-black border border-neutral-800 text-xs font-condensed tracking-wider text-white px-3 py-1.5 uppercase focus:outline-none focus:border-[#C52222]"
                    />
                    <button 
                      type="submit"
                      className="bg-neutral-900 hover:bg-[#C52222] text-white text-xs font-condensed px-3 py-1.5 uppercase font-bold tracking-wider border border-neutral-700 cursor-pointer"
                    >
                      APLICAR
                    </button>
                  </form>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-[#110808] border border-[#C52222]/30 px-3 py-1.5 text-xs">
                    <span className="text-[#C52222] font-condensed font-bold uppercase tracking-wider">
                      CUPÓN ACTIVO: {appliedCoupon} (-{couponDiscountPercent}%)
                    </span>
                    <button 
                      onClick={removeCoupon}
                      className="text-neutral-500 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-neutral-900 bg-black space-y-3">
            <div className="space-y-1.5 text-xs font-condensed tracking-wider uppercase">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#C52222]">
                  <span>DESCUENTO ({couponDiscountPercent}%)</span>
                  <span>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>ENVÍO</span>
                <span>{shippingCost === 0 ? <strong className="text-emerald-400">GRATIS</strong> : `€${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-sm font-bold text-neutral-100">
                <span>TOTAL</span>
                <span className="text-[#C52222] text-base">€{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-[#9E1B1B] hover:bg-[#C52222] text-white font-condensed font-bold text-sm tracking-[0.2em] uppercase py-3.5 transition-all hard-box glow-red-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>FINALIZAR PEDIDO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
