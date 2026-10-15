import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { pb, mapPbProduct, POCKETBASE_URL, detectColorFromText, COLOR_DEFINITIONS, getThumbUrl } from '../lib/pocketbase';

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
        if (Array.isArray(parsed) && parsed.length >= initialProducts.length) return parsed;
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
  const [adminCreds, setAdminCreds] = useState(() => {
    const model = pb.authStore?.model || pb.authStore?.record;
    if (model && model.email) {
      return {
        username: model.email,
        email: model.email,
        name: model.name || 'Administrador Patria Nostra',
        role: pb.authStore.isSuperuser ? 'Super Administrador' : 'Administrador'
      };
    }
    return DEFAULT_ADMIN_CREDS;
  });

  // 4. Admin Auth Session (Validación criptográfica estricta mediante PocketBase JWT)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return Boolean(pb.authStore && pb.authStore.isValid);
  });

  // Sincronizar cambios de sesión en tiempo real y entre pestañas
  useEffect(() => {
    const checkAuth = () => {
      const valid = Boolean(pb.authStore && pb.authStore.isValid);
      setIsAdminAuthenticated(valid);
      if (valid) {
        localStorage.setItem('pn_admin_authenticated', 'true');
        const model = pb.authStore?.model || pb.authStore?.record;
        if (model && model.email) {
          setAdminCreds({
            username: model.email,
            email: model.email,
            name: model.name || 'Administrador Patria Nostra',
            role: pb.authStore.isSuperuser ? 'Super Administrador' : 'Administrador'
          });
        }
      } else {
        localStorage.removeItem('pn_admin_authenticated');
      }
    };

    checkAuth();

    const unsubPb = pb.authStore.onChange((token, model) => {
      checkAuth();
    });

    const handleStorage = (e) => {
      if (e.key === 'pn_admin_authenticated' || e.key === 'pocketbase_auth') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorage);

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

  // Auto-reparar registros existentes en PocketBase que tengan campo image o gallery vacío
  useEffect(() => {
    if (!isAdminAuthenticated || !pb.authStore.isValid) return;

    const repairEmptyImagesInPb = async () => {
      try {
        const records = await pb.collection('products').getFullList({ requestKey: null });
        for (const r of records) {
          const hasEmptyImage = !r.image || r.image === '';
          const hasEmptyGallery = !r.gallery || (Array.isArray(r.gallery) && r.gallery.length === 0);
          if ((hasEmptyImage || hasEmptyGallery) && Array.isArray(r.images) && r.images.length > 0) {
            const col = r.collectionId || r.collectionName || 'pbc_4092854851';
            const fullGallery = r.images.map(img => `${POCKETBASE_URL}/api/files/${col}/${r.id}/${img}`);
            const mainImg = fullGallery[0];
            await pb.collection('products').update(r.id, {
              image: mainImg,
              gallery: fullGallery
            }, { requestKey: null });
          }
        }

        // Auto-actualizar definición de miniaturas en la colección 'products' de PocketBase
        if (pb.authStore.isSuperuser || pb.admins) {
          try {
            const col = await pb.collections.getOne('products');
            const fields = col.fields || col.schema || [];
            const imagesField = fields.find(f => f.name === 'images');
            if (imagesField) {
              const currentThumbs = imagesField.thumbs || [];
              const desiredThumbs = ['100x100', '480x480'];
              const missingThumbs = desiredThumbs.filter(t => !currentThumbs.includes(t));
              if (missingThumbs.length > 0) {
                imagesField.thumbs = Array.from(new Set([...currentThumbs, ...desiredThumbs]));
                await pb.collections.update('products', {
                  ...(col.fields ? { fields } : { schema: fields })
                });
              }
            }
          } catch (colErr) {
            console.warn('Configuración de thumbs en PocketBase:', colErr?.message || colErr);
          }
        }
      } catch (err) {
        console.warn('Auto-reparación preventiva PocketBase:', err?.message || err);
      }
    };

    repairEmptyImagesInPb();
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
  const cleanUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    // Descartar data URLs (base64) o blob URLs para no romper límites de PocketBase ni payload
    if (url.startsWith('data:') || url.startsWith('blob:')) return '';
    return url;
  };

  const cleanGalleryItem = (item) => {
    if (!item) return null;
    if (typeof item === 'string') {
      const u = cleanUrl(item);
      return u ? u : null;
    }
    if (typeof item === 'object' && item.url) {
      const u = cleanUrl(item.url);
      if (!u) return null;
      return { url: u, color: item.color || null };
    }
    return null;
  };

  const getFileWithColor = (file, colorName) => {
    if (!(file instanceof File) || !colorName) return file;
    const safeColor = colorName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dotIdx = file.name.lastIndexOf('.');
    const ext = dotIdx >= 0 ? file.name.substring(dotIdx) : '.webp';
    const baseName = dotIdx >= 0 ? file.name.substring(0, dotIdx) : file.name;
    if (baseName.toLowerCase().includes(safeColor)) return file;
    return new File([file], `${baseName}_${safeColor}${ext}`, { type: file.type });
  };

  const addProduct = async (productData) => {
    if (!pb.authStore || !pb.authStore.isValid) {
      setIsAdminAuthenticated(false);
      localStorage.removeItem('pn_admin_authenticated');
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

    const activeColors = Array.isArray(productData.colors) && productData.colors.length > 0
      ? productData.colors
      : [productData.defaultColor || 'Negro'];

    // 1. Recopilar todos los archivos reales a subir con su color asignado
    let filesToUpload = [];
    if (Array.isArray(productData.imageItems)) {
      filesToUpload = productData.imageItems
        .filter(it => it && it.file instanceof File)
        .map(it => ({
          file: it.file,
          color: it.color || productData.defaultColor || activeColors[0] || 'Negro'
        }));
    } else {
      if (productData.mainImageFile instanceof File) {
        filesToUpload.push({
          file: productData.mainImageFile,
          color: productData.defaultColor || activeColors[0] || 'Negro'
        });
      }
      if (Array.isArray(productData.galleryFiles)) {
        productData.galleryFiles.forEach(f => {
          if (f instanceof File) {
            filesToUpload.push({
              file: f,
              color: null
            });
          }
        });
      }
    }

    const hasFiles = filesToUpload.length > 0;
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
      fd.append('colors', JSON.stringify(activeColors));

      // Adjuntar archivos reales a FormData con su color en el nombre
      filesToUpload.forEach(item => {
        fd.append('images', getFileWithColor(item.file, item.color));
      });

      pbRecord = await pb.collection('products').create(fd, { requestKey: null });
    } else {
      const fallbackMain = cleanUrl(productData.image) || '/producto.webp';
      const fallbackGallery = (Array.isArray(productData.gallery) ? productData.gallery : [])
        .map(cleanUrl)
        .filter(Boolean);

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
        colors: activeColors,
        isFeatured,
        image: fallbackMain,
        gallery: fallbackGallery.length > 0 ? fallbackGallery : ['/producto.webp']
      }, { requestKey: null });
    }

    // Auto-vincular de forma permanente la imagen y galería con sus variantes por color
    if (pbRecord && Array.isArray(pbRecord.images) && pbRecord.images.length > 0) {
      const col = pbRecord.collectionId || pbRecord.collectionName || 'pbc_4092854851';
      const galleryWithColorObjects = pbRecord.images.map((img, idx) => {
        const fullUrl = `${POCKETBASE_URL}/api/files/${col}/${pbRecord.id}/${img}`;
        const colorFromUpload = filesToUpload[idx]?.color;
        const colorFromFilename = detectColorFromText(img)?.name;
        const finalColor = colorFromUpload || colorFromFilename || (idx === 0 ? (productData.defaultColor || activeColors[0]) : null);
        return {
          url: fullUrl,
          color: finalColor
        };
      });

      // Determinar la foto principal dando prioridad a la variante por defecto o la primera foto real subida
      const targetDefaultColor = productData.defaultColor || activeColors[0];
      const defaultColorMatch = galleryWithColorObjects.find(g => 
        g.color === targetDefaultColor && g.url && !g.url.includes('/producto.webp') && !g.url.startsWith('blob:')
      );
      const firstRealImage = galleryWithColorObjects.find(g => 
        g.url && !g.url.includes('/producto.webp') && !g.url.startsWith('blob:')
      );
      const mainImg = defaultColorMatch?.url || firstRealImage?.url || '/producto.webp';

      // Garantizar que todos los colores activos tengan una foto asignada en la galería
      activeColors.forEach(colName => {
        const exists = galleryWithColorObjects.some(g => g.color === colName);
        if (!exists) {
          galleryWithColorObjects.push({
            url: mainImg,
            color: colName
          });
        }
      });

      try {
        pbRecord = await pb.collection('products').update(pbRecord.id, {
          image: mainImg,
          gallery: galleryWithColorObjects,
          colors: activeColors
        }, { requestKey: null });
      } catch (linkErr) {
        console.warn('Auto-enlace de variantes en PocketBase:', linkErr);
      }
    }

    const mapped = mapPbProduct(pbRecord);
    if (productData.defaultColor) {
      mapped.defaultColor = productData.defaultColor;
    }

    setProducts(prev => [mapped, ...prev.filter(p => p.id !== mapped.id)]);
    return mapped;
  };

  const updateProduct = async (productId, updatedData) => {
    if (!pb.authStore || !pb.authStore.isValid) {
      setIsAdminAuthenticated(false);
      localStorage.removeItem('pn_admin_authenticated');
      throw new Error('No hay una sesión activa de administrador en PocketBase. Por favor vuelve a iniciar sesión en el panel.');
    }

    let finalSizeStock = updatedData.sizeStock;
    let finalStock = updatedData.stock;

    if (finalSizeStock && typeof finalSizeStock === 'object') {
      finalStock = Object.values(finalSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
    }

    const activeColors = Array.isArray(updatedData.colors) && updatedData.colors.length > 0
      ? updatedData.colors
      : [updatedData.defaultColor || 'Negro'];

    const hasNewFiles = Array.isArray(updatedData.imageItems) && updatedData.imageItems.some(it => it.file instanceof File);
    const hasImageItems = Array.isArray(updatedData.imageItems) && updatedData.imageItems.length > 0;

    let updatedRecord;

    if (hasNewFiles) {
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
      fd.append('colors', JSON.stringify(activeColors));

      // Distinguir entre archivos nuevos a subir y archivos existentes a conservar
      const newFilesToUpload = [];
      const existingImagesToKeep = [];

      (updatedData.imageItems || []).forEach(it => {
        if (!it) return;
        if (it.file instanceof File) {
          const itemColor = it.color || updatedData.defaultColor || activeColors[0] || 'Negro';
          newFilesToUpload.push({ file: it.file, color: itemColor });
          fd.append('images', getFileWithColor(it.file, itemColor));
        } else {
          const raw = it.rawName || (typeof it.url === 'string' && it.url.includes('/api/files/') ? it.url.split('/').pop().split('?')[0] : null);
          if (raw && !raw.startsWith('blob:') && raw !== 'producto.webp') {
            existingImagesToKeep.push({ rawName: raw, url: it.url, color: it.color });
            fd.append('images', raw);
          }
        }
      });

      updatedRecord = await pb.collection('products').update(productId, fd, { requestKey: null });

      // Auto-vincular de forma permanente la imagen y galería con sus variantes por color
      if (updatedRecord && Array.isArray(updatedRecord.images) && updatedRecord.images.length > 0) {
        const col = updatedRecord.collectionId || updatedRecord.collectionName || 'pbc_4092854851';
        const galleryWithColorObjects = updatedRecord.images.map((img, idx) => {
          const fullUrl = `${POCKETBASE_URL}/api/files/${col}/${updatedRecord.id}/${img}`;
          
          const matchExisting = existingImagesToKeep.find(ex => ex.rawName === img || (ex.url && ex.url.includes(img)));
          const matchNew = newFilesToUpload.find(nf => img.toLowerCase().includes((nf.color || '').toLowerCase()));
          const detectedColor = detectColorFromText(img)?.name;
          const finalColor = matchExisting?.color || matchNew?.color || detectedColor || (idx === 0 ? (updatedData.defaultColor || activeColors[0]) : null);
          return {
            url: fullUrl,
            color: finalColor
          };
        });

        const targetDefaultColor = updatedData.defaultColor || activeColors[0];
        const defaultColorMatch = galleryWithColorObjects.find(g => 
          g.color === targetDefaultColor && g.url && !g.url.includes('/producto.webp') && !g.url.startsWith('blob:')
        );
        const firstRealImage = galleryWithColorObjects.find(g => 
          g.url && !g.url.includes('/producto.webp') && !g.url.startsWith('blob:')
        );
        const mainImg = defaultColorMatch?.url || firstRealImage?.url || '/producto.webp';

        activeColors.forEach(colName => {
          const exists = galleryWithColorObjects.some(g => g.color === colName);
          if (!exists) {
            galleryWithColorObjects.push({
              url: mainImg,
              color: colName
            });
          }
        });

        try {
          updatedRecord = await pb.collection('products').update(updatedRecord.id, {
            image: mainImg,
            gallery: galleryWithColorObjects,
            colors: activeColors
          }, { requestKey: null });
        } catch (linkErr) {
          console.warn('Auto-enlace de variantes en PocketBase update:', linkErr);
        }
      }
    } else {
      // Sin archivos nuevos de PC: actualizar campos y persistir variantes de color directamente
      let galleryWithColorObjects = [];
      if (hasImageItems) {
        galleryWithColorObjects = updatedData.imageItems
          .map((it, idx) => {
            const detectedColor = detectColorFromText(it.rawName || it.url)?.name;
            const finalColor = it.color || detectedColor || (idx === 0 ? (updatedData.defaultColor || activeColors[0]) : null);
            return {
              url: it.url,
              color: finalColor
            };
          })
          .filter(it => it.url && !it.url.startsWith('blob:') && !it.url.startsWith('data:'));
      } else if (Array.isArray(updatedData.gallery)) {
        galleryWithColorObjects = updatedData.gallery.map(cleanGalleryItem).filter(Boolean);
      }

      const targetDefaultColor = updatedData.defaultColor || activeColors[0];
      const defaultColorMatch = galleryWithColorObjects.find(g => 
        g.color === targetDefaultColor && g.url && !g.url.includes('/producto.webp')
      );
      const firstRealImage = galleryWithColorObjects.find(g => 
        g.url && !g.url.includes('/producto.webp')
      );
      const mainImg = defaultColorMatch?.url || firstRealImage?.url || cleanUrl(updatedData.image) || '/producto.webp';

      activeColors.forEach(colName => {
        const exists = galleryWithColorObjects.some(g => g.color === colName);
        if (!exists) {
          galleryWithColorObjects.push({
            url: mainImg,
            color: colName
          });
        }
      });

      updatedRecord = await pb.collection('products').update(productId, {
        ...(updatedData.name !== undefined ? { name: updatedData.name.trim().toUpperCase() } : {}),
        ...(updatedData.description !== undefined ? { description: updatedData.description } : {}),
        ...(updatedData.price !== undefined ? { price: Math.round(Number(updatedData.price)) } : {}),
        ...(updatedData.originalPrice !== undefined ? { originalPrice: updatedData.originalPrice ? Math.round(Number(updatedData.originalPrice)) : null } : {}),
        ...(finalStock !== undefined ? { stock: Number(finalStock) } : {}),
        ...(finalSizeStock !== undefined ? { sizeStock: finalSizeStock } : {}),
        ...(updatedData.badge !== undefined ? { badge: updatedData.badge } : {}),
        ...(updatedData.category !== undefined ? { category: (updatedData.category || '').toLowerCase() } : {}),
        ...(updatedData.isFeatured !== undefined ? { isFeatured: !!updatedData.isFeatured } : {}),
        ...(updatedData.sizes !== undefined ? { sizes: updatedData.sizes } : {}),
        ...(updatedData.specs !== undefined ? { specs: updatedData.specs } : {}),
        colors: activeColors,
        image: cleanUrl(mainImg) || '/producto.webp',
        gallery: galleryWithColorObjects.length > 0 ? galleryWithColorObjects : ['/producto.webp']
      }, { requestKey: null });
    }

    const mapped = mapPbProduct(updatedRecord);
    if (updatedData.defaultColor) {
      mapped.defaultColor = updatedData.defaultColor;
    }

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
          image: it.colorImage || it.product?.image || '/producto.webp'
        },
        size: it.size || 'Única',
        color: it.color || it.product?.defaultColor || 'Negro',
        colorImage: it.colorImage || it.product?.image || '/producto.webp',
        quantity: it.quantity || 1
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
