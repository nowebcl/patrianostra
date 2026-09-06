import React, { createContext, useContext, useState } from 'react';
import { useStore } from './StoreContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { products } = useStore();

  // Cart state initialized with 1 item if available
  const [cart, setCart] = useState(() => {
    return products && products.length > 0
      ? [{ product: products[0], size: 'L', quantity: 1 }]
      : [];
  });

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

  const addToCart = (productId, size = 'L', quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sizeStock = product.sizeStock || {};
    const availableStock = sizeStock[size] !== undefined ? Number(sizeStock[size]) : (product.stock || 0);

    if (availableStock <= 0) {
      showToast(`⚠️ La talla ${size} de ${product.name} está agotada.`);
      return;
    }

    let reachedMax = false;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product.id === productId && item.size === size
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
        return [...prevCart, { product, size, quantity: initialQty }];
      }
    });

    if (reachedMax) {
      showToast(`Stock máximo alcanzado (${availableStock} u.) para talla ${size}`);
    } else {
      setIsCartOpen(true);
      showToast(`Añadido: ${product.name} (${size})`);
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
      const sizeStock = currentProduct?.sizeStock || {};
      const maxAvailable = sizeStock[item.size] !== undefined 
        ? Number(sizeStock[item.size]) 
        : (currentProduct?.stock !== undefined ? Number(currentProduct.stock) : 99);

      if (delta > 0 && newQty > maxAvailable) {
        showToast(`⚠️ Stock máximo alcanzado (${maxAvailable} u.) para talla ${item.size}`);
        return prevCart;
      }

      updated[index] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => {
      const item = prevCart[index];
      if (item) {
        showToast(`Se eliminó "${item.product.name}" del carrito`);
      }
      return prevCart.filter((_, i) => i !== index);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'PATRIA10' || clean === 'CHILE10' || clean === 'DESCUENTO') {
      setAppliedCoupon(clean);
      setCouponDiscountPercent(10);
      showToast('¡Cupón del 10% aplicado con éxito!');
      return { success: true, message: 'Cupón del 10% aplicado' };
    } else if (clean === 'PATRIA20' || clean === 'VIP') {
      setAppliedCoupon(clean);
      setCouponDiscountPercent(20);
      showToast('¡Cupón VIP del 20% aplicado!');
      return { success: true, message: 'Cupón del 20% aplicado' };
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
  const shippingCost = subtotal >= 60000 || subtotal === 0 ? 0 : 4990;
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        appliedCoupon,
        couponDiscountPercent,
        applyCoupon,
        removeCoupon,
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
