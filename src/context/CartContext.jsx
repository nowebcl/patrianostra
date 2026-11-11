import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from './StoreContext';
import { getSizeStock } from '../utils/stock';

export const FREE_SHIPPING_THRESHOLD = 70000;
const CART_STORAGE_KEY = 'patria_nostra_cart';

const COUPON_DISCOUNTS = {
  PATRIA10: 10,
  CHILE10: 10,
  DESCUENTO: 10,
  PATRIA20: 20,
  VIP: 20
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { products } = useStore();

  // Cargar carrito guardado en localStorage o iniciar vacío (nunca pre-cargar productos de muestra)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.product && Number(item.quantity) > 0);
        }
      }
    } catch (e) {
      console.warn('Error cargando carrito desde localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  // Drawer and Modals states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Promo code / Discount state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);

  // Last completed order for confirmation
  const [lastOrder, setLastOrder] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 3000);
  };

  const addToCart = (productId, size = 'L', quantity = 1, color = null, customImage = null) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const availableStock = getSizeStock(product, size);

    if (availableStock <= 0) {
      showToast(`⚠️ No hay stock en talla ${size} de ${product.name}.`);
      return;
    }

    const chosenColor = color || product.defaultColor || (product.colors && product.colors[0]) || 'Negro';
    const chosenImage = customImage || (product.colorImages && product.colorImages[chosenColor]) || product.image;

    let reachedMax = false;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product.id === productId && item.size === size && (item.color === chosenColor)
      );

      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = Math.min(availableStock, currentQty + quantity);
        if (newQty === currentQty) {
          reachedMax = true;
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(availableStock, quantity);
        return [...prevCart, { 
          product: { ...product, image: chosenImage }, 
          size, 
          color: chosenColor,
          colorImage: chosenImage,
          quantity: initialQty 
        }];
      }
    });

    if (reachedMax) {
      showToast(`Stock máximo disponible alcanzado para talla ${size}`);
    } else {
      setIsCartOpen(true);
      showToast(`Añadido: ${product.name} (${size} • ${chosenColor})`);
    }
  };

  const updateQuantity = (index, delta) => {
    setCart(prevCart => {
      const updated = [...prevCart];
      const item = updated[index];
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
        return updated;
      }

      // Validar stock disponible para la talla específica
      const currentProduct = products.find(p => p.id === item.product?.id) || item.product;
      const maxAvailable = getSizeStock(currentProduct, item.size);

      if (delta > 0 && newQty > maxAvailable) {
        showToast(`⚠️ Stock máximo disponible alcanzado para talla ${item.size}`);
        return prevCart;
      }

      updated[index] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    const item = cart[index];
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
    if (item) {
      showToast(`Se eliminó "${item.product.name}" del carrito`);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const restoreCart = (items = [], couponCode = null) => {
    if (Array.isArray(items) && items.length > 0) {
      setCart(items.filter(it => it && it.product));
    }
    const cleanCode = couponCode ? String(couponCode).trim().toUpperCase() : '';
    const percent = COUPON_DISCOUNTS[cleanCode] || 0;
    if (percent > 0) {
      setAppliedCoupon(cleanCode);
      setCouponDiscountPercent(percent);
    } else {
      setAppliedCoupon(null);
      setCouponDiscountPercent(0);
    }
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    const percent = COUPON_DISCOUNTS[clean] || 0;
    if (percent > 0) {
      setAppliedCoupon(clean);
      setCouponDiscountPercent(percent);
      showToast(percent === 20 ? '¡Cupón VIP del 20% aplicado!' : `¡Cupón del ${percent}% aplicado con éxito!`);
      return { success: true, message: `Cupón del ${percent}% aplicado` };
    } else {
      showToast('Cupón no válido o expirado');
      return { success: false, message: 'Cupón no válido' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    showToast('Cupón eliminado');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = Math.round((subtotal * couponDiscountPercent) / 100);
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        restoreCart,
        totalItems,
        subtotal,
        discountAmount,
        appliedCoupon,
        couponDiscountPercent,
        applyCoupon,
        removeCoupon,
        freeShippingThreshold,
        hasFreeShipping,
        shippingCost,
        finalTotal,
        lastOrder,
        setLastOrder,
        isCartOpen,
        setIsCartOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isManifestoOpen,
        setIsManifestoOpen,
        quickViewProduct,
        setQuickViewProduct,
        toast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
