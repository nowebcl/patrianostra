import PocketBase from 'pocketbase';

export const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://patrianostradistropb.noweb.cl';

export const pb = new PocketBase(POCKETBASE_URL);

// Paleta y definiciones de colores estándar para indumentaria streetwear
export const COLOR_DEFINITIONS = [
  { name: 'Negro', hex: '#111111', regex: /negr[oa]/i },
  { name: 'Blanco', hex: '#FFFFFF', regex: /blanc[oa]/i },
  { name: 'Azul', hex: '#1E3A8A', regex: /azul/i },
  { name: 'Burdeo', hex: '#581C24', regex: /burdeo|bordo|vino/i },
  { name: 'Gris', hex: '#6B7280', regex: /gris|plomo|melange/i },
  { name: 'Rojo', hex: '#B91C1C', regex: /roj[oa]/i },
  { name: 'Verde Militar', hex: '#3F4E34', regex: /verd[ea]|militar/i },
  { name: 'Amarillo', hex: '#EAB308', regex: /amarill[oa]/i }
];

export function detectColorFromText(text) {
  if (!text || typeof text !== 'string') return null;
  for (const def of COLOR_DEFINITIONS) {
    if (def.regex.test(text)) {
      return def;
    }
  }
  return null;
}

export const MUSIC_CATEGORIES_SET = new Set(['música', 'musica', 'vinilos', 'vinilo', 'cds', 'cd', 'casetes', 'casete', 'cassettes', 'cassette']);

export const isMusicCategory = (cat) => {
  if (!cat || typeof cat !== 'string') return false;
  return MUSIC_CATEGORIES_SET.has(cat.toLowerCase().trim());
};

export const isClothingCategory = (cat, sizes = []) => {
  if (!cat || typeof cat !== 'string') return false;
  const lower = cat.toLowerCase().trim();
  if (MUSIC_CATEGORIES_SET.has(lower) || lower === 'accesorios') return false;
  if (/polera|camiseta|poleron|hoodie|pantalon|prenda|streetwear/i.test(lower)) return true;
  if (Array.isArray(sizes) && sizes.some(s => ['S', 'M', 'L', 'XL', 'XXL', '2XL'].includes(s))) return true;
  return false;
};

// Helper ultra-rápido para miniaturas PocketBase (13KB vs 2.3MB de la foto original)
export const getThumbUrl = (url, thumb = '100x100') => {
  if (!url || typeof url !== 'string') return '/producto.webp';
  if (!url.includes('/api/files/')) return url;
  if (url.includes('thumb=')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}thumb=${thumb}`;
};

// Helper de optimización y enrutamiento inteligente de imágenes
export const getOptimizedImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '/producto.webp';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  
  // En desarrollo local (Vite en localhost:3000), enrutar archivos de PocketBase
  // a través del proxy local ultrarrápido con caché en disco (.cache/pocketbase-images).
  // Esto elimina la latencia de 160ms con New York y el estrangulamiento de 70KB/s del VPS.
  if (import.meta.env.DEV && url.startsWith('https://patrianostradistropb.noweb.cl/api/files/')) {
    return url.replace('https://patrianostradistropb.noweb.cl', '');
  }
  return url;
};

// Helper para obtener URL de archivo de PocketBase con fallback seguro y absoluto
export const getProductImageUrl = (record, filename, queryParams = {}) => {
  if (!record) return '/producto.webp';

  // Si ya es una URL completa o una ruta local relativa
  if (typeof filename === 'string' && (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/'))) {
    return filename;
  }

  const targetFile = filename || (Array.isArray(record.images) && record.images[0]);
  const col = record.collectionId || record.collectionName || 'pbc_4092854851';
  
  if (record.id && targetFile) {
    try {
      if (pb.files?.getURL) {
        const url = pb.files.getURL({ id: record.id, collectionId: col }, targetFile, queryParams);
        if (url) return url;
      }
      return `${POCKETBASE_URL}/api/files/${col}/${record.id}/${targetFile}`;
    } catch (e) {
      console.warn('Error resolviendo URL de imagen en PocketBase:', e);
      return `${POCKETBASE_URL}/api/files/${col}/${record.id}/${targetFile}`;
    }
  }

  // Fallback
  return record.image || '/producto.webp';
};

// Transforma un registro de PocketBase al formato uniforme de la aplicación con soporte de colores
export const mapPbProduct = (record) => {
  if (!record) return null;

  const images = Array.isArray(record.images) ? record.images : [];
  const col = record.collectionId || record.collectionName || 'pbc_4092854851';
  
  const getFileUrl = (file) => {
    if (!file || typeof file !== 'string' || !file.trim()) return null;
    if (file.startsWith('blob:') || file.startsWith('data:')) return null;
    if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('/')) {
      return getOptimizedImageUrl(file);
    }
    if (record.id && file) {
      return getOptimizedImageUrl(`${POCKETBASE_URL}/api/files/${col}/${record.id}/${file}`);
    }
    return null;
  };

  // 1. Procesar galería original
  let rawGallery = record.gallery;
  if (typeof rawGallery === 'string') {
    try { rawGallery = JSON.parse(rawGallery); } catch { rawGallery = []; }
  }
  if (!Array.isArray(rawGallery)) rawGallery = [];

  const colorImages = {};
  const colors = [];
  const gallery = [];

  // Mapear objetos { url, color } si ya venían guardados con color
  rawGallery.forEach(item => {
    if (item && typeof item === 'object' && item.url) {
      const fullUrl = getFileUrl(item.url);
      if (fullUrl && fullUrl !== '/producto.webp' && !gallery.includes(fullUrl)) gallery.push(fullUrl);
      if (item.color && fullUrl && fullUrl !== '/producto.webp') {
        colorImages[item.color] = fullUrl;
        if (!colors.includes(item.color)) colors.push(item.color);
      }
    } else if (typeof item === 'string' && item.trim()) {
      const fullUrl = getFileUrl(item);
      if (fullUrl && fullUrl !== '/producto.webp' && !gallery.includes(fullUrl)) gallery.push(fullUrl);
    }
  });

  // Mapear archivos directos de record.images
  images.forEach(img => {
    const fullUrl = getFileUrl(img);
    if (fullUrl && fullUrl !== '/producto.webp' && !gallery.includes(fullUrl)) {
      gallery.push(fullUrl);
    }
    const detected = detectColorFromText(img);
    if (detected && fullUrl && fullUrl !== '/producto.webp' && !colorImages[detected.name]) {
      colorImages[detected.name] = fullUrl;
      if (!colors.includes(detected.name)) {
        colors.push(detected.name);
      }
    }
  });

  // Determinar la foto principal real del producto
  let mainImage = (record.image ? getFileUrl(record.image) : null) || gallery[0] || '/producto.webp';
  if (mainImage === '/producto.webp' && gallery.length > 0 && gallery[0] !== '/producto.webp') {
    mainImage = gallery[0];
  }

  // Asegurar que mainImage esté al inicio de gallery si es una foto válida
  if (mainImage && mainImage !== '/producto.webp') {
    const existingIdx = gallery.indexOf(mainImage);
    if (existingIdx > 0) {
      gallery.splice(existingIdx, 1);
      gallery.unshift(mainImage);
    } else if (existingIdx === -1) {
      gallery.unshift(mainImage);
    }
  }

  // Asegurar que gallery nunca quede vacía
  if (gallery.length === 0) {
    gallery.push('/producto.webp');
  }

  const cat = record.category || '';
  const isClothing = isClothingCategory(cat, record.sizes);

  // Procesar campo colors directo solo si es prenda de vestir
  let rawColors = record.colors;
  if (typeof rawColors === 'string') {
    try { rawColors = JSON.parse(rawColors); } catch { rawColors = []; }
  }
  if (Array.isArray(rawColors) && isClothing) {
    rawColors.forEach(c => {
      if (typeof c === 'string' && c.trim() && !colors.includes(c.trim())) {
        colors.push(c.trim());
      }
    });
  }

  // Si es prenda de vestir y no tiene color, asignar 'Negro' a la foto principal por defecto
  if (isClothing) {
    if (colors.length === 0) {
      colors.push('Negro');
      colorImages['Negro'] = mainImage;
    } else if (!colorImages['Negro'] && colors.length > 0 && !colors.includes('Negro')) {
      if (!colorImages[colors[0]]) {
        colorImages[colors[0]] = mainImage;
      }
    }
    // Garantizar que todos los colores tengan una foto asignada
    colors.forEach(c => {
      if (!colorImages[c]) {
        colorImages[c] = mainImage;
      }
    });
  } else {
    // Si NO es prenda de vestir (CDs, Vinilos, Casetes, etc.), vaciar colores por completo
    colors.length = 0;
  }

  const colorItems = isClothing ? colors.map(cName => {
    const def = COLOR_DEFINITIONS.find(d => d.name === cName) || { name: cName, hex: '#444444' };
    return {
      name: cName,
      hex: def.hex,
      image: colorImages[cName] || mainImage
    };
  }) : [];

  // Procesar especificaciones: solo prendas de vestir llevan especificaciones de fabricación
  let specs = record.specs;
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = []; }
  }
  if (!Array.isArray(specs)) specs = [];
  if (!isClothing) {
    specs = [];
  }

  let sizes = record.sizes;
  if (typeof sizes === 'string') {
    try { sizes = JSON.parse(sizes); } catch { sizes = ['S', 'M', 'L', 'XL']; }
  }
  if (!Array.isArray(sizes) || sizes.length === 0) sizes = ['S', 'M', 'L', 'XL'];

  // Procesar stock por talla (sizeStock) con fallback inteligente
  let sizeStock = record.sizeStock;
  if (typeof sizeStock === 'string') {
    try { sizeStock = JSON.parse(sizeStock); } catch { sizeStock = null; }
  }
  if (!sizeStock || typeof sizeStock !== 'object' || Array.isArray(sizeStock)) {
    sizeStock = {};
    const total = record.stock !== undefined ? Number(record.stock) : 10;
    const perSize = Math.max(0, Math.floor(total / (sizes.length || 1)));
    const remainder = total % (sizes.length || 1);
    sizes.forEach((sz, idx) => {
      sizeStock[sz] = perSize + (idx === 0 ? remainder : 0);
    });
  }

  const calculatedStock = Object.values(sizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);

  let description = record.description || '';
  if (description.includes('serigrafía') || description.includes('serigrafia')) {
    description = description
      .replace(/con serigrafía de máxima fidelidad y resistencia/gi, 'con estampados en DTF de alta calidad, resistentes e ilustraciones de máxima definición')
      .replace(/serigrafía/gi, 'estampados en DTF de alta calidad')
      .replace(/serigrafia/gi, 'estampados en DTF de alta calidad');
  }

  return {
    id: record.id,
    collectionId: col,
    collectionName: record.collectionName || 'products',
    sku: record.sku || `PN-${record.id.slice(0, 6).toUpperCase()}`,
    name: record.name || 'Producto Sin Nombre',
    price: Number(record.price) || 0,
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    category: record.category || 'Poleras',
    badge: record.badge || null,
    stock: calculatedStock,
    sizeStock,
    gender: record.gender || 'Unisex',
    gsm: record.gsm || '240 GSM Algodón Pesado',
    fit: record.fit || 'Corte Regular',
    description,
    specs,
    sizes: Object.keys(sizeStock).length > 0 ? Object.keys(sizeStock) : sizes,
    isFeatured: !!record.isFeatured,
    image: mainImage,
    gallery,
    rawImages: images,
    colors,
    colorImages,
    colorItems,
    defaultColor: isClothing ? (colors[0] || 'Negro') : null,
    created: record.created,
    updated: record.updated
  };
};
