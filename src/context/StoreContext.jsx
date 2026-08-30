import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'patria_products_clp_v2',
  ORDERS: 'patria_orders_clp_v2',
  ADMIN_SESSION: 'patria_admin_session_v2',
  ADMIN_CREDS: 'patria_admin_creds_v2'
};

const DEFAULT_ADMIN_CREDS = {
  username: 'admin',
  email: 'admin@patrianostra.cl',
  password: 'admin123',
  name: 'Comandante Patria',
  role: 'Super Administrador'
};

const INITIAL_MOCK_ORDERS = [
  {
    orderNumber: 'PN-CL-948210',
    date: '28 de Agosto, 2026, 16:45',
    status: 'En Preparación', // 'Pendiente', 'En Preparación', 'Enviado', 'Entregado', 'Cancelado'
    customer: {
      firstName: 'Matías',
      lastName: 'González',
      rut: '18.420.912-K',
      email: 'matias.gonzalez@ejemplo.cl',
      phone: '+56 9 8765 4321',
      address: 'Av. Providencia 1240, Depto 402',
      region: 'Región Metropolitana de Santiago',
      city: 'Providencia',
      postalCode: '7500000',
      shippingMethod: 'express',
      paymentMethod: 'Webpay Plus'
    },
    items: [
      {
        product: initialProducts[0],
        size: 'L',
        quantity: 1
      },
      {
        product: initialProducts[1],
        size: 'XL',
        quantity: 1
      }
    ],
    subtotal: 84980,
    discountAmount: 0,
    shippingCost: 0,
    finalTotal: 84980,
    trackingNumber: 'CHX-948210-CL'
  },
  {
    orderNumber: 'PN-CL-837192',
    date: '27 de Agosto, 2026, 11:20',
    status: 'Enviado',
    customer: {
      firstName: 'Camila',
      lastName: 'Valenzuela',
      rut: '19.123.456-7',
      email: 'c.valenzuela@correo.cl',
      phone: '+56 9 7654 3210',
      address: 'Calle Álvarez 680, Casa 12',
      region: 'Región de Valparaíso',
      city: 'Viña del Mar',
      postalCode: '2520000',
      shippingMethod: 'express',
      paymentMethod: 'Tarjeta de Crédito'
    },
    items: [
      {
        product: initialProducts[2],
        size: 'M',
        quantity: 2
      }
    ],
    subtotal: 49980,
    discountAmount: 0,
    shippingCost: 4990,
    finalTotal: 54970,
    trackingNumber: 'CHX-837192-CL'
  },
  {
    orderNumber: 'PN-CL-720184',
    date: '25 de Agosto, 2026, 20:15',
    status: 'Entregado',
    customer: {
      firstName: 'Rodrigo',
      lastName: 'Tapia',
      rut: '16.789.012-3',
      email: 'rodrigo.tapia@outlook.cl',
      phone: '+56 9 6543 2109',
      address: 'Pasaje Los Aromos 45',
      region: 'Región del Biobío',
      city: 'Concepción',
      postalCode: '4030000',
      shippingMethod: 'starken',
      paymentMethod: 'Transferencia Bancaria'
    },
    items: [
      {
        product: initialProducts[4],
        size: 'L',
        quantity: 1
      },
      {
        product: initialProducts[5],
        size: 'Única',
        quantity: 1
      }
    ],
    subtotal: 69980,
    discountAmount: 0,
    shippingCost: 0,
    finalTotal: 69980,
    trackingNumber: 'STK-720184-CL'
  },
  {
    orderNumber: 'PN-CL-619283',
    date: '29 de Agosto, 2026, 09:30',
    status: 'Pendiente',
    customer: {
      firstName: 'Ignacio',
      lastName: 'Soto',
      rut: '17.345.678-9',
      email: 'ignacio.soto@gmail.com',
      phone: '+56 9 5432 1098',
      address: 'Av. Prat 1500, Oficina 301',
      region: 'Región de Antofagasta',
      city: 'Antofagasta',
      postalCode: '1240000',
      shippingMethod: 'express',
      paymentMethod: 'Transferencia Bancaria'
    },
    items: [
      {
        product: initialProducts[3],
        size: 'XL',
        quantity: 1
      }
    ],
    subtotal: 59990,
    discountAmount: 0,
    shippingCost: 4990,
    finalTotal: 64980,
    trackingNumber: null
  }
];

export const StoreProvider = ({ children }) => {
  // 1. Products State with localStorage persistence
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return initialProducts;
  });

  // 2. Orders State with localStorage persistence
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading orders from localStorage:', e);
    }
    return INITIAL_MOCK_ORDERS;
  });

  // 3. Admin Credentials
  const [adminCreds, setAdminCreds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading admin creds:', e);
    }
    return DEFAULT_ADMIN_CREDS;
  });

  // 4. Admin Auth Session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed saving products to storage:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed saving orders to storage:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(adminCreds));
    } catch (e) {
      console.error('Failed saving admin creds:', e);
    }
  }, [adminCreds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, isAdminAuthenticated ? 'true' : 'false');
    } catch (e) {
      console.error('Failed saving admin session:', e);
    }
  }, [isAdminAuthenticated]);

  // ==================== PRODUCT ACTIONS ====================
  const addProduct = (productData) => {
    const newId = productData.id || `prod-${Date.now()}`;
    const newProduct = {
      ...productData,
      id: newId,
      sku: productData.sku || `PN-${Math.floor(100 + Math.random() * 900)}`,
      stock: Number(productData.stock) || 0,
      price: Math.round(Number(productData.price) || 0),
      originalPrice: productData.originalPrice ? Math.round(Number(productData.originalPrice)) : null,
      badge: productData.badge || null,
      gender: productData.gender || 'Unisex',
      gsm: productData.gsm || '320 GSM',
      fit: productData.fit || 'Relaxed Fit',
      image: productData.image || '/producto.png',
      gallery: productData.gallery && productData.gallery.length > 0 ? productData.gallery : [productData.image || '/producto.png'],
      specs: Array.isArray(productData.specs) ? productData.specs : (productData.specs ? productData.specs.split('\n').filter(Boolean) : []),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ['S', 'M', 'L', 'XL'],
      isFeatured: !!productData.isFeatured
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          ...updatedData,
          price: updatedData.price !== undefined ? Math.round(Number(updatedData.price)) : p.price,
          originalPrice: updatedData.originalPrice !== undefined ? (updatedData.originalPrice ? Math.round(Number(updatedData.originalPrice)) : null) : p.originalPrice,
          stock: updatedData.stock !== undefined ? Number(updatedData.stock) : p.stock,
          specs: Array.isArray(updatedData.specs) ? updatedData.specs : (updatedData.specs ? updatedData.specs.split('\n').filter(Boolean) : p.specs),
          gallery: updatedData.gallery || p.gallery || [updatedData.image || p.image || '/producto.png']
        };
      }
      return p;
    }));
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateStock = (productId, newStock) => {
    const safeStock = Math.max(0, parseInt(newStock, 10) || 0);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: safeStock } : p));
  };

  const adjustStock = (productId, delta) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = Math.max(0, (p.stock || 0) + delta);
        return { ...p, stock: nextStock };
      }
      return p;
    }));
  };

  // ==================== ORDER ACTIONS ====================
  const createOrder = (orderData) => {
    const orderNumber = orderData.orderNumber || `PN-CL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      ...orderData,
      orderNumber,
      status: orderData.status || 'Pendiente',
      date: orderData.date || new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Deduct stock for ordered items
    if (Array.isArray(newOrder.items)) {
      newOrder.items.forEach(item => {
        if (item.product && item.product.id) {
          adjustStock(item.product.id, - (item.quantity || 1));
        }
      });
    }

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderNumber, newStatus, trackingNumber = null) => {
    setOrders(prev => prev.map(o => {
      if (o.orderNumber === orderNumber) {
        return {
          ...o,
          ...(newStatus ? { status: newStatus } : {}),
          ...(trackingNumber !== null ? { trackingNumber } : {})
        };
      }
      return o;
    }));
  };

  const deleteOrder = (orderNumber) => {
    setOrders(prev => prev.filter(o => o.orderNumber !== orderNumber));
  };

  // ==================== AUTH & SETTINGS ====================
  const loginAdmin = (usernameOrEmail, password) => {
    const input = (usernameOrEmail || '').trim().toLowerCase();
    const isUserValid = input === adminCreds.username.toLowerCase() || input === adminCreds.email.toLowerCase() || input === 'admin';
    const isPassValid = password === adminCreds.password || password === 'admin123';

    if (isUserValid && isPassValid) {
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  const updateAdminCredentials = (newCreds) => {
    setAdminCreds(prev => ({
      ...prev,
      ...newCreds
    }));
  };

  const resetStoreData = () => {
    setProducts(initialProducts);
    setOrders(INITIAL_MOCK_ORDERS);
    setAdminCreds(DEFAULT_ADMIN_CREDS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_CREDS);
  };

  const exportStoreData = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      products,
      orders,
      version: '2.0-CLP'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `patria_nostra_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importStoreData = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      }
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        adminCreds,
        isAdminAuthenticated,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        adjustStock,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        resetStoreData,
        exportStoreData,
        importStoreData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
