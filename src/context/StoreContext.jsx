import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { pb, mapPbProduct } from '../lib/pocketbase';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'patria_products_clp_v3',
  ORDERS: 'patria_orders_clp_v3'
};

const DEFAULT_ADMIN_CREDS = {
  username: 'contacto@patrianostradistro.cl',
  email: 'contacto@patrianostradistro.cl',
  name: 'Administrador Patria Nostra',
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

  // 3. Admin Profile State
  const [adminCreds, setAdminCreds] = useState(DEFAULT_ADMIN_CREDS);

  // 4. Admin Auth Session (Validación criptográfica estricta mediante PocketBase JWT + localStorage para sincronía entre pestañas)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('pn_admin_authenticated');
      if (savedAuth === 'true') return true;
    } catch (e) {}
    return Boolean(pb.authStore && pb.authStore.isValid);
  });

  // Sincronizar cambios de sesión en tiempo real y entre pestañas
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'pn_admin_authenticated' || e.key === 'pocketbase_auth') {
        const isAuth = localStorage.getItem('pn_admin_authenticated') === 'true' || Boolean(pb.authStore && pb.authStore.isValid);
        setIsAdminAuthenticated(isAuth);
      }
    };
    window.addEventListener('storage', handleStorage);

    const unsubPb = pb.authStore.onChange((token, model) => {
      const valid = Boolean(token && pb.authStore.isValid);
      setIsAdminAuthenticated(valid);
      if (valid) {
        localStorage.setItem('pn_admin_authenticated', 'true');
      } else {
        localStorage.removeItem('pn_admin_authenticated');
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (typeof unsubPb === 'function') unsubPb();
    };
  }, []);

  // Refrescar periódicamente la sesión de administrador para evitar tokens expirados silenciosamente
  useEffect(() => {
    if (pb.authStore && pb.authStore.isValid) {
      const refreshSession = async () => {
        try {
          if (pb.authStore.isSuperuser) {
            await pb.collection('_superusers').authRefresh();
          } else if (pb.authStore.model?.collectionName === 'users') {
            await pb.collection('users').authRefresh();
          } else {
            await pb.collection('_superusers').authRefresh().catch(() => pb.collection('users').authRefresh());
          }
          setIsAdminAuthenticated(true);
          localStorage.setItem('pn_admin_authenticated', 'true');
        } catch (e) {
          console.warn('Verificación de sesión PocketBase:', e?.message || e);
          if (!pb.authStore.isValid) {
            setIsAdminAuthenticated(false);
            localStorage.removeItem('pn_admin_authenticated');
          }
        }
      };
      refreshSession();
    }
  }, []);

  // 5. PocketBase Remote Connection and Loading State
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isPbConnected, setIsPbConnected] = useState(false);

  // Carga remota inicial y suscripción a eventos en tiempo real
  useEffect(() => {
    let isMounted = true;

    const fetchPbProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const records = await pb.collection('products').getFullList({
          requestKey: null,
          sort: '-created,-@rowid'
        });

        if (isMounted && Array.isArray(records)) {
          const mapped = records.map(mapPbProduct);
          const testItem = initialProducts.find(p => p.id === 'test-pago-flow');
          const hasTest = mapped.some(p => p.id === 'test-pago-flow' || p.sku === 'PN-TEST-FLOW');
          const finalProducts = (testItem && !hasTest) ? [testItem, ...mapped] : mapped;
          setProducts(finalProducts);
          setIsPbConnected(true);
        }
      } catch (err) {
        console.warn('PocketBase no disponible o en espera, usando caché local:', err?.message || err);
        if (isMounted) setIsPbConnected(false);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    };

    fetchPbProducts();

    // Suscripción Realtime a la colección 'products'
    let unsubscribeFn = null;
    pb.collection('products').subscribe('*', (e) => {
      if (!isMounted) return;
      if (e.action === 'create') {
        const item = mapPbProduct(e.record);
        setProducts(prev => [item, ...prev.filter(p => p.id !== item.id)]);
      } else if (e.action === 'update') {
        const item = mapPbProduct(e.record);
        setProducts(prev => prev.map(p => p.id === item.id ? item : p));
      } else if (e.action === 'delete') {
        setProducts(prev => prev.filter(p => p.id !== e.record.id));
      }
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(e => {
      console.warn('Suscripción tiempo real no iniciada:', e?.message || e);
    });

    return () => {
      isMounted = false;
      if (unsubscribeFn) unsubscribeFn();
      else pb.collection('products').unsubscribe('*').catch(() => {});
    };
  }, []);

  // 6. Carga y sincronización de pedidos desde PocketBase para administradores
  useEffect(() => {
    let isMounted = true;
    let unsubscribeFn = null;

    if (!isAdminAuthenticated || !pb.authStore.isValid) return;

    const loadOrders = async () => {
      try {
        const records = await pb.collection('orders').getFullList({
          requestKey: null
        });

        if (isMounted && Array.isArray(records)) {
          records.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
          setOrders(records);
        }
      } catch (err) {
        console.warn('No se pudieron cargar pedidos de PocketBase:', err?.message || err);
      }
    };

    loadOrders();

    pb.collection('orders').subscribe('*', (e) => {
      if (!isMounted) return;
      if (e.action === 'create') {
        setOrders(prev => [e.record, ...prev.filter(o => o.id !== e.record.id && o.orderNumber !== e.record.orderNumber)]);
      } else if (e.action === 'update') {
        setOrders(prev => prev.map(o => (o.id === e.record.id || o.orderNumber === e.record.orderNumber) ? e.record : o));
      } else if (e.action === 'delete') {
        setOrders(prev => prev.filter(o => o.id !== e.record.id && o.orderNumber !== e.record.orderNumber));
      }
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(e => {
      console.warn('Suscripción a pedidos en PocketBase no disponible:', e?.message || e);
    });

    return () => {
      isMounted = false;
      if (unsubscribeFn) unsubscribeFn();
      else if (pb.authStore.isValid) pb.collection('orders').unsubscribe('*').catch(() => {});
    };
  }, [isAdminAuthenticated]);

  // 7. Store Construction / Maintenance Mode (por defecto activo para el público)
  const [isUnderConstruction, setIsUnderConstruction] = useState(() => {
    try {
      const saved = localStorage.getItem('pn_under_construction');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true; // Default: En construcción
  });

  // Sincronización del estado de En Construcción desde PocketBase
  useEffect(() => {
    let isMounted = true;
    let unsubscribeFn = null;

    const fetchMaintenanceSetting = async () => {
      try {
        const records = await pb.collection('settings').getFullList({
          filter: 'key = "maintenance_mode"',
          requestKey: null
        });
        if (isMounted && records.length > 0 && records[0].value?.enabled !== undefined) {
          const enabled = Boolean(records[0].value.enabled);
          setIsUnderConstruction(enabled);
          localStorage.setItem('pn_under_construction', JSON.stringify(enabled));
        }
      } catch (err) {
        console.warn('Configuración de modo construcción en PocketBase:', err?.message || err);
      }
    };

    fetchMaintenanceSetting();

    pb.collection('settings').subscribe('*', (e) => {
      if (!isMounted) return;
      if (e.record?.key === 'maintenance_mode' && e.record.value?.enabled !== undefined) {
        const enabled = Boolean(e.record.value.enabled);
        setIsUnderConstruction(enabled);
        localStorage.setItem('pn_under_construction', JSON.stringify(enabled));
      }
    }).then(unsub => {
      unsubscribeFn = unsub;
    }).catch(e => {
      console.warn('Suscripción tiempo real settings:', e?.message || e);
    });

    return () => {
      isMounted = false;
      if (unsubscribeFn) unsubscribeFn();
      else pb.collection('settings').unsubscribe('*').catch(() => {});
    };
  }, []);

  const setMaintenanceMode = async (enabled) => {
    setIsUnderConstruction(enabled);
    localStorage.setItem('pn_under_construction', JSON.stringify(enabled));

    if (pb.authStore && pb.authStore.isValid) {
      try {
        const records = await pb.collection('settings').getFullList({
          filter: 'key = "maintenance_mode"',
          requestKey: null
        });
        if (records.length > 0) {
          await pb.collection('settings').update(records[0].id, {
            value: { enabled }
          }, { requestKey: null });
        } else {
          await pb.collection('settings').create({
            key: 'maintenance_mode',
            value: { enabled }
          }, { requestKey: null });
        }
      } catch (err) {
        console.error('Error al actualizar modo construcción en PocketBase:', err);
      }
    }
  };

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

  // ==================== PRODUCT ACTIONS ====================
  const addProduct = async (productData) => {
    if (!pb.authStore.isValid) {
      throw new Error('No hay una sesión activa de administrador en PocketBase. Por favor vuelve a iniciar sesión en el panel.');
    }

    const sizes = Array.isArray(productData.sizes) && productData.sizes.length > 0 
      ? productData.sizes 
      : ['S', 'M', 'L', 'XL'];
    
    // Calcular sizeStock y stock total
    let sizeStock = productData.sizeStock;
    if (!sizeStock || typeof sizeStock !== 'object') {
      sizeStock = {};
      const baseTotal = Number(productData.stock) || 10;
      const perSize = Math.floor(baseTotal / (sizes.length || 1));
      const remainder = baseTotal % (sizes.length || 1);
      sizes.forEach((sz, idx) => {
        sizeStock[sz] = perSize + (idx === 0 ? remainder : 0);
      });
    }
    const totalStock = Object.values(sizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);

    const sku = productData.sku || `PN-POL-${Math.floor(100 + Math.random() * 900)}`;
    const category = (productData.category || 'poleras').toLowerCase();
    const price = Math.round(Number(productData.price) || 0);
    const originalPrice = productData.originalPrice ? Math.round(Number(productData.originalPrice)) : null;
    const badge = productData.badge || '';
    const description = productData.description || '';
    const gender = productData.gender || 'Unisex';
    const gsm = productData.gsm || '240 GSM Algodón Pesado';
    const fit = productData.fit || 'Corte Regular';
    const specs = Array.isArray(productData.specs) ? productData.specs : (productData.specs ? productData.specs.split('\n').filter(Boolean) : []);
    const isFeatured = !!productData.isFeatured;
    const mainImageUrl = productData.image || '/producto.webp';
    const galleryUrls = productData.gallery && productData.gallery.length > 0 ? productData.gallery : [mainImageUrl];

    const hasFiles = (Array.isArray(productData.imageItems) && productData.imageItems.some(it => it.file instanceof File)) ||
                     (productData.mainImageFile instanceof File) ||
                     (Array.isArray(productData.galleryFiles) && productData.galleryFiles.some(f => f instanceof File));

    let pbRecord;

    if (hasFiles) {
      const fd = new FormData();
      fd.append('name', productData.name.trim().toUpperCase());
      fd.append('description', description);
      fd.append('price', String(price));
      if (originalPrice) fd.append('originalPrice', String(originalPrice));
      fd.append('category', category);
      if (badge) fd.append('badge', badge);
      fd.append('stock', String(totalStock));
      fd.append('sizeStock', JSON.stringify(sizeStock));
      fd.append('gender', gender);
      fd.append('sku', sku);
      fd.append('gsm', gsm);
      fd.append('fit', fit);
      fd.append('specs', JSON.stringify(specs));
      fd.append('sizes', JSON.stringify(sizes));
      fd.append('isFeatured', String(isFeatured));
      fd.append('image', mainImageUrl);
      fd.append('gallery', JSON.stringify(galleryUrls));

      if (Array.isArray(productData.imageItems)) {
        productData.imageItems.forEach(it => {
          if (it.file instanceof File) fd.append('images', it.file);
        });
      } else {
        if (productData.mainImageFile instanceof File) fd.append('images', productData.mainImageFile);
        if (Array.isArray(productData.galleryFiles)) {
          productData.galleryFiles.forEach(f => {
            if (f instanceof File) fd.append('images', f);
          });
        }
      }

      pbRecord = await pb.collection('products').create(fd, { requestKey: null });
    } else {
      pbRecord = await pb.collection('products').create({
        name: productData.name.trim().toUpperCase(),
        description,
        price,
        originalPrice,
        category,
        badge,
        stock: totalStock,
        sizeStock,
        gender,
        sku,
        gsm,
        fit,
        specs,
        sizes,
        isFeatured,
        image: mainImageUrl,
        gallery: galleryUrls
      }, { requestKey: null });
    }

    const mapped = mapPbProduct(pbRecord);
    setProducts(prev => [mapped, ...prev.filter(p => p.id !== mapped.id)]);
    return mapped;
  };

  const updateProduct = async (productId, updatedData) => {
    if (!pb.authStore.isValid) {
      throw new Error('No hay una sesión activa de administrador en PocketBase.');
    }

    let finalSizeStock = updatedData.sizeStock;
    let finalStock = updatedData.stock;

    if (finalSizeStock && typeof finalSizeStock === 'object') {
      finalStock = Object.values(finalSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
    }

    const hasNewFiles = Array.isArray(updatedData.imageItems) && updatedData.imageItems.some(it => it.file instanceof File);

    let updatedRecord;

    if (hasNewFiles || (Array.isArray(updatedData.imageItems) && updatedData.imageItems.length > 0)) {
      const fd = new FormData();
      if (updatedData.name !== undefined) fd.append('name', updatedData.name.trim().toUpperCase());
      if (updatedData.description !== undefined) fd.append('description', updatedData.description);
      if (updatedData.price !== undefined) fd.append('price', String(Math.round(Number(updatedData.price))));
      if (updatedData.originalPrice !== undefined) fd.append('originalPrice', updatedData.originalPrice ? String(Math.round(Number(updatedData.originalPrice))) : '');
      if (finalStock !== undefined) fd.append('stock', String(Number(finalStock)));
      if (finalSizeStock !== undefined) fd.append('sizeStock', JSON.stringify(finalSizeStock));
      if (updatedData.badge !== undefined) fd.append('badge', updatedData.badge || '');
      if (updatedData.category !== undefined) fd.append('category', (updatedData.category || '').toLowerCase());
      if (updatedData.isFeatured !== undefined) fd.append('isFeatured', String(!!updatedData.isFeatured));
      if (updatedData.sizes !== undefined) fd.append('sizes', JSON.stringify(updatedData.sizes));
      if (updatedData.specs !== undefined) fd.append('specs', JSON.stringify(updatedData.specs));
      if (updatedData.image !== undefined) fd.append('image', updatedData.image);
      if (updatedData.gallery !== undefined) fd.append('gallery', JSON.stringify(updatedData.gallery));

      updatedData.imageItems.forEach(it => {
        if (it.file instanceof File) {
          fd.append('images', it.file);
        } else if (it.rawName) {
          fd.append('images', it.rawName);
        }
      });

      updatedRecord = await pb.collection('products').update(productId, fd, { requestKey: null });
    } else {
      updatedRecord = await pb.collection('products').update(productId, {
        ...(updatedData.name !== undefined ? { name: updatedData.name.trim().toUpperCase() } : {}),
        ...(updatedData.description !== undefined ? { description: updatedData.description } : {}),
        ...(updatedData.price !== undefined ? { price: Math.round(Number(updatedData.price)) } : {}),
        ...(updatedData.originalPrice !== undefined ? { originalPrice: updatedData.originalPrice ? Math.round(Number(updatedData.originalPrice)) : null } : {}),
        ...(finalStock !== undefined ? { stock: Number(finalStock) } : {}),
        ...(finalSizeStock !== undefined ? { sizeStock: finalSizeStock } : {}),
        ...(updatedData.badge !== undefined ? { badge: updatedData.badge } : {}),
        ...(updatedData.category !== undefined ? { category: updatedData.category.toLowerCase() } : {}),
        ...(updatedData.isFeatured !== undefined ? { isFeatured: !!updatedData.isFeatured } : {}),
        ...(updatedData.sizes !== undefined ? { sizes: updatedData.sizes } : {}),
        ...(updatedData.specs !== undefined ? { specs: updatedData.specs } : {}),
        ...(updatedData.image !== undefined ? { image: updatedData.image } : {}),
        ...(updatedData.gallery !== undefined ? { gallery: updatedData.gallery } : {})
      }, { requestKey: null });
    }

    const mapped = mapPbProduct(updatedRecord);
    setProducts(prev => prev.map(p => p.id === productId ? mapped : p));
    return mapped;
  };

  const updateSizeStock = async (productId, size, newQty) => {
    const safeQty = Math.max(0, parseInt(newQty, 10) || 0);
    let updatedProduct = null;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextSizeStock = { ...(p.sizeStock || {}), [size]: safeQty };
        const nextTotal = Object.values(nextSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
        updatedProduct = { ...p, sizeStock: nextSizeStock, stock: nextTotal };
        return updatedProduct;
      }
      return p;
    }));

    if (pb.authStore.isValid && updatedProduct) {
      try {
        await pb.collection('products').update(productId, {
          sizeStock: updatedProduct.sizeStock,
          stock: updatedProduct.stock
        }, { requestKey: null });
      } catch (err) {
        console.warn('Error actualizando stock por talla en PocketBase:', err?.message || err);
      }
    }
  };

  const adjustSizeStock = async (productId, size, delta) => {
    let updatedProduct = null;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const currentQty = Number(p.sizeStock?.[size]) || 0;
        const nextQty = Math.max(0, currentQty + delta);
        const nextSizeStock = { ...(p.sizeStock || {}), [size]: nextQty };
        const nextTotal = Object.values(nextSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
        updatedProduct = { ...p, sizeStock: nextSizeStock, stock: nextTotal };
        return updatedProduct;
      }
      return p;
    }));

    if (pb.authStore.isValid && updatedProduct) {
      try {
        await pb.collection('products').update(productId, {
          sizeStock: updatedProduct.sizeStock,
          stock: updatedProduct.stock
        }, { requestKey: null });
      } catch (err) {
        console.warn('Error ajustando stock por talla en PocketBase:', err?.message || err);
      }
    }
  };

  const deleteProduct = async (productId) => {
    if (pb.authStore.isValid) {
      await pb.collection('products').delete(productId, { requestKey: null });
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateStock = async (productId, newStock) => {
    const safeStock = Math.max(0, parseInt(newStock, 10) || 0);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: safeStock } : p));
    if (pb.authStore.isValid) {
      try {
        await pb.collection('products').update(productId, { stock: safeStock }, { requestKey: null });
      } catch (err) {
        console.warn('Error actualizando stock en PocketBase:', err?.message || err);
      }
    }
  };

  const adjustStock = async (productId, delta) => {
    let finalStock = null;
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = Math.max(0, (p.stock || 0) + delta);
        finalStock = nextStock;
        return { ...p, stock: nextStock };
      }
      return p;
    }));

    if (pb.authStore.isValid && finalStock !== null) {
      try {
        await pb.collection('products').update(productId, { stock: finalStock }, { requestKey: null });
      } catch (err) {
        console.warn('Error ajustando stock en PocketBase:', err?.message || err);
      }
    }
  };

  // ==================== ORDER ACTIONS ====================
  const createOrder = async (orderData) => {
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
          if (item.size) {
            adjustSizeStock(item.product.id, item.size, - (item.quantity || 1));
          } else {
            adjustStock(item.product.id, - (item.quantity || 1));
          }
        }
      });
    }

    // Persistir remotamente a PocketBase (createRule pública para checkout de clientes)
    try {
      const sanitizedItems = Array.isArray(newOrder.items) ? newOrder.items.map(it => ({
        product: {
          id: it.product?.id,
          name: it.product?.name,
          price: it.product?.price,
          image: it.product?.image
        },
        size: it.size,
        quantity: it.quantity
      })) : [];

      const record = await pb.collection('orders').create({
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        date: newOrder.date,
        customer: newOrder.customer,
        items: sanitizedItems,
        subtotal: Number(newOrder.subtotal) || 0,
        discountAmount: Number(newOrder.discountAmount) || 0,
        shippingCost: Number(newOrder.shippingCost) || 0,
        finalTotal: Number(newOrder.finalTotal) || 0,
        trackingNumber: newOrder.trackingNumber || ''
      });
      newOrder.id = record.id;
    } catch (err) {
      console.warn('Error registrando pedido en PocketBase:', err?.message || err);
    }

    setOrders(prev => [newOrder, ...prev.filter(o => o.orderNumber !== newOrder.orderNumber)]);
    return newOrder;
  };

  const updateOrderStatus = async (orderNumber, newStatus, trackingNumber = null) => {
    const targetOrder = orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber);

    setOrders(prev => prev.map(o => {
      if (o.orderNumber === orderNumber || o.id === orderNumber) {
        return {
          ...o,
          ...(newStatus ? { status: newStatus } : {}),
          ...(trackingNumber !== null ? { trackingNumber } : {})
        };
      }
      return o;
    }));

    if (pb.authStore.isValid && targetOrder) {
      try {
        let pbId = targetOrder.id;
        if (!pbId || pbId.length !== 15) {
          const item = await pb.collection('orders').getFirstListItem(`orderNumber="${targetOrder.orderNumber}"`);
          pbId = item.id;
        }
        if (pbId) {
          await pb.collection('orders').update(pbId, {
            ...(newStatus ? { status: newStatus } : {}),
            ...(trackingNumber !== null ? { trackingNumber } : {})
          });
        }
      } catch (err) {
        console.warn('Error actualizando pedido en PocketBase:', err?.message || err);
      }
    }
  };

  const deleteOrder = async (orderNumber) => {
    const targetOrder = orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber);
    setOrders(prev => prev.filter(o => o.orderNumber !== orderNumber && o.id !== orderNumber));

    if (pb.authStore.isValid && targetOrder) {
      try {
        let pbId = targetOrder.id;
        if (!pbId || pbId.length !== 15) {
          const item = await pb.collection('orders').getFirstListItem(`orderNumber="${targetOrder.orderNumber}"`);
          pbId = item.id;
        }
        if (pbId) {
          await pb.collection('orders').delete(pbId);
        }
      } catch (err) {
        console.warn('Error eliminando pedido en PocketBase:', err?.message || err);
      }
    }
  };

  // ==================== AUTH & SETTINGS ====================
  const loginAdmin = async (usernameOrEmail, password) => {
    const input = (usernameOrEmail || '').trim();
    if (!input || !password) {
      return { success: false, message: 'Por favor ingresa usuario y contraseña.' };
    }

    // 1. Intentar como Superuser en _superusers (PocketBase v0.23+)
    try {
      const authData = await pb.collection('_superusers').authWithPassword(input, password);
      if (authData && authData.token && pb.authStore.isValid) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('pn_admin_authenticated', 'true');
        setAdminCreds({
          username: authData.record?.email || input,
          email: authData.record?.email || input,
          name: authData.record?.name || 'Administrador Patria Nostra',
          role: 'Super Administrador'
        });
        return { success: true };
      }
    } catch (pbErr) {
      // Continuar con los siguientes métodos
    }

    // 2. Intentar como Admin clásico (PocketBase < v0.23)
    try {
      if (pb.admins) {
        const authData = await pb.admins.authWithPassword(input, password);
        if (authData && authData.token && pb.authStore.isValid) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('pn_admin_authenticated', 'true');
          setAdminCreds({
            username: authData.admin?.email || input,
            email: authData.admin?.email || input,
            name: 'Administrador Patria Nostra',
            role: 'Super Administrador'
          });
          return { success: true };
        }
      }
    } catch (adminErr) {
      // Continuar
    }

    // 3. Intentar como usuario en colección 'users'
    try {
      const authData = await pb.collection('users').authWithPassword(input, password);
      if (authData && authData.token && pb.authStore.isValid) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('pn_admin_authenticated', 'true');
        setAdminCreds({
          username: authData.record?.email || input,
          email: authData.record?.email || input,
          name: authData.record?.name || 'Administrador Patria Nostra',
          role: 'Administrador'
        });
        return { success: true };
      }
    } catch (userErr) {
      // Fallaron todos
    }

    setIsAdminAuthenticated(false);
    localStorage.removeItem('pn_admin_authenticated');
    return { success: false, message: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('pn_admin_authenticated');
    pb.authStore.clear();
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
        isLoadingProducts,
        isPbConnected,
        adminCreds,
        isAdminAuthenticated,
        isUnderConstruction,
        setIsUnderConstruction,
        setMaintenanceMode,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        adjustStock,
        updateSizeStock,
        adjustSizeStock,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        resetStoreData,
        exportStoreData,
        importStoreData,
        pb
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
