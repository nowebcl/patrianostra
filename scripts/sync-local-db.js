import PocketBase from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(POCKETBASE_URL);

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

export function mapProduct(record) {
  const images = Array.isArray(record.images) ? record.images : [];
  const col = record.collectionId || record.collectionName || 'pbc_4092854851';

  const getFileUrl = (file) => {
    if (!file) return '/producto.webp';
    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('/'))) {
      return file;
    }
    if (record.id && file) {
      return `${POCKETBASE_URL}/api/files/${col}/${record.id}/${file}`;
    }
    return '/producto.webp';
  };

  // 1. Raw gallery processing
  let rawGallery = record.gallery;
  if (typeof rawGallery === 'string') {
    try { rawGallery = JSON.parse(rawGallery); } catch { rawGallery = []; }
  }
  if (!Array.isArray(rawGallery)) rawGallery = [];

  // 2. Build full gallery URLs & detect colors
  const colorImages = {};
  const colors = [];
  const gallery = [];

  // Check if rawGallery contains objects with { url, color }
  rawGallery.forEach(item => {
    if (item && typeof item === 'object' && item.url) {
      const fullUrl = getFileUrl(item.url);
      if (!gallery.includes(fullUrl)) gallery.push(fullUrl);
      if (item.color) {
        colorImages[item.color] = fullUrl;
        if (!colors.includes(item.color)) colors.push(item.color);
      }
    } else if (typeof item === 'string' && item.trim()) {
      const fullUrl = getFileUrl(item);
      if (!gallery.includes(fullUrl)) gallery.push(fullUrl);
    }
  });

  // If gallery empty or images exist, populate from images
  images.forEach(img => {
    const fullUrl = getFileUrl(img);
    if (!gallery.includes(fullUrl)) {
      gallery.push(fullUrl);
    }
    const detected = detectColorFromText(img);
    if (detected && !colorImages[detected.name]) {
      colorImages[detected.name] = fullUrl;
      if (!colors.includes(detected.name)) {
        colors.push(detected.name);
      }
    }
  });

  if (gallery.length === 0) {
    if (record.image && typeof record.image === 'string' && record.image.trim()) {
      gallery.push(getFileUrl(record.image));
    } else {
      gallery.push('/producto.webp');
    }
  }

  const mainImage = gallery[0] || '/producto.webp';

  // Ensure default color if none found
  if (colors.length === 0) {
    colors.push('Negro');
    colorImages['Negro'] = mainImage;
  } else if (!colorImages['Negro'] && colors.length > 0 && !colors.includes('Negro')) {
    // If first image isn't named with color, associate it with first color or Negro
    if (!colorImages[colors[0]]) {
      colorImages[colors[0]] = mainImage;
    }
  }

  const colorItems = colors.map(cName => {
    const def = COLOR_DEFINITIONS.find(d => d.name === cName) || { name: cName, hex: '#444444' };
    return {
      name: cName,
      hex: def.hex,
      image: colorImages[cName] || mainImage
    };
  });

  // Specs
  let specs = record.specs;
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = []; }
  }
  if (!Array.isArray(specs)) specs = [];

  // Sizes & sizeStock
  let sizes = record.sizes;
  if (typeof sizes === 'string') {
    try { sizes = JSON.parse(sizes); } catch { sizes = ['S', 'M', 'L', 'XL']; }
  }
  if (!Array.isArray(sizes) || sizes.length === 0) sizes = ['S', 'M', 'L', 'XL'];

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
    description: record.description || '',
    specs,
    sizes: Object.keys(sizeStock).length > 0 ? Object.keys(sizeStock) : sizes,
    isFeatured: !!record.isFeatured,
    image: mainImage,
    gallery,
    rawImages: images,
    colors,
    colorImages,
    colorItems,
    defaultColor: colors[0] || 'Negro',
    created: record.created,
    updated: record.updated
  };
}

async function main() {
  console.log('🔄 Conectando con PocketBase en producción:', POCKETBASE_URL);
  const records = await pb.collection('products').getFullList({
    requestKey: null,
    sort: '-created,-@rowid'
  });

  console.log(`✅ ${records.length} productos obtenidos de la base de datos real.`);

  const mappedProducts = records.map(mapProduct);

  // Preserve test flow product as item #0
  const testFlowProduct = {
    id: 'test-pago-flow',
    collectionId: 'local',
    collectionName: 'products',
    name: 'TEST DE PAGO FLOW',
    price: 350,
    originalPrice: 1000,
    image: '/producto.webp',
    gallery: ['/producto.webp'],
    badge: 'MÍNIMO $350 CLP',
    category: 'Accesorios',
    gender: 'Unisex',
    stock: 999,
    sku: 'PN-TEST-FLOW',
    gsm: 'Digital / Test',
    fit: 'Prueba Flow',
    description: 'Producto oficial para pruebas de pasarela de pago Flow con el monto mínimo ($350 CLP). Permite verificar la conexión segura, pago en vivo con Webpay/Tarjetas, retorno automático y generación del comprobante en PDF con datos de despacho.',
    specs: [
      'Monto mínimo oficial Flow: $350 CLP',
      'Sin costo adicional de envío ($0 CLP en prueba)',
      'Verificación de flujo de pago en vivo',
      'Descarga automática de comprobante PDF oficial'
    ],
    sizes: ['Única'],
    isFeatured: true,
    isTest: true,
    sizeStock: { 'Única': 999 },
    colors: ['Negro'],
    colorImages: { 'Negro': '/producto.webp' },
    colorItems: [{ name: 'Negro', hex: '#111111', image: '/producto.webp' }],
    defaultColor: 'Negro'
  };

  const finalProducts = [testFlowProduct, ...mappedProducts.filter(p => p.id !== 'test-pago-flow' && p.sku !== 'PN-TEST-FLOW')];

  console.log(`📦 Total productos locales actualizados: ${finalProducts.length}`);

  const productsJsPath = path.join(rootDir, 'src', 'data', 'products.js');
  const collaborationsJs = `export const collaborations = [
  {
    "id": "kronstadt",
    "title": "KRONSTADT",
    "subtitle": "SIN CONCESIONES",
    "image": "/assets/images/collab_kronstadt_img.png",
    "badge": null,
    "actionText": "DISPONIBLE AHORA →"
  },
  {
    "id": "bastion",
    "title": "BASTIÓN",
    "subtitle": "HXC",
    "image": "/assets/images/collab_bastion_img.png",
    "badge": "PRÓXIMAMENTE",
    "actionText": null
  },
  {
    "id": "disidencia",
    "title": "DISIDENCIA",
    "subtitle": "PUNK ROCK",
    "image": "/assets/images/collab_disidencia_img.png",
    "badge": "PRÓXIMAMENTE",
    "actionText": null
  }
];\n`;

  const outputCode = `export const products = ${JSON.stringify(finalProducts, null, 2)};\n\n${collaborationsJs}`;

  fs.writeFileSync(productsJsPath, outputCode, 'utf-8');
  console.log(`🎉 ¡Archivo ${productsJsPath} actualizado exitosamente sin borrar nada!`);
}

main().catch(err => {
  console.error('❌ Error en sincronización:', err);
  process.exit(1);
});
