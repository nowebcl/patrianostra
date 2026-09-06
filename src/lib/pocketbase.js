import PocketBase from 'pocketbase';

export const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://pn.noweb.tech';

export const pb = new PocketBase(POCKETBASE_URL);

// Helper para obtener URL de archivo de PocketBase con fallback seguro
export const getProductImageUrl = (record, filename, queryParams = {}) => {
  if (!record) return '/producto.png';

  // Si ya es una URL completa o una ruta local relativa
  if (typeof filename === 'string' && (filename.startsWith('http') || filename.startsWith('/'))) {
    return filename;
  }

  // Si tiene array de imágenes de PocketBase
  const targetFile = filename || (Array.isArray(record.images) && record.images[0]);
  if (record.id && targetFile) {
    try {
      return pb.files.getUrl(record, targetFile, queryParams);
    } catch (e) {
      console.warn('Error resolviendo URL de imagen en PocketBase:', e);
    }
  }

  // Fallback
  return record.image || '/producto.png';
};

// Transforma un registro de PocketBase al formato uniforme de la aplicación
export const mapPbProduct = (record) => {
  if (!record) return null;

  const images = Array.isArray(record.images) ? record.images : [];
  
  // Construir galería con URLs de PocketBase
  const gallery = images.length > 0
    ? images.map(img => pb.files.getUrl(record, img))
    : (record.gallery || [record.image || '/producto.png']);

  const mainImage = gallery.length > 0 ? gallery[0] : (record.image || '/producto.png');

  // Procesar especificaciones y tallas en caso de venir como string JSON
  let specs = record.specs;
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = []; }
  }
  if (!Array.isArray(specs)) specs = [];

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

  return {
    id: record.id,
    sku: record.sku || `PN-${record.id.slice(0, 6).toUpperCase()}`,
    name: record.name || 'Producto Sin Nombre',
    price: Number(record.price) || 0,
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    category: record.category || 'Poleras',
    badge: record.badge || null,
    stock: calculatedStock,
    sizeStock,
    gender: record.gender || 'Unisex',
    gsm: record.gsm || '320 GSM',
    fit: record.fit || 'Oversize',
    description: record.description || '',
    specs,
    sizes: Object.keys(sizeStock).length > 0 ? Object.keys(sizeStock) : sizes,
    isFeatured: !!record.isFeatured,
    image: mainImage,
    gallery,
    rawImages: images,
    created: record.created,
    updated: record.updated
  };
};
