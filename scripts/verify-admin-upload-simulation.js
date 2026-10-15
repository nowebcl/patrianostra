import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(PB_URL);

const COLOR_DEFINITIONS = [
  { name: 'Negro', hex: '#111111', regex: /negr[oa]/i },
  { name: 'Blanco', hex: '#FFFFFF', regex: /blanc[oa]/i },
  { name: 'Azul', hex: '#1E3A8A', regex: /azul/i },
  { name: 'Burdeo', hex: '#581C24', regex: /burdeo|bordo|vino/i },
  { name: 'Gris', hex: '#6B7280', regex: /gris|plomo|melange/i },
  { name: 'Rojo', hex: '#B91C1C', regex: /roj[oa]/i },
  { name: 'Verde Militar', hex: '#3F4E34', regex: /verd[ea]|militar/i },
  { name: 'Amarillo', hex: '#EAB308', regex: /amarill[oa]/i }
];

function detectColorFromText(text) {
  if (!text || typeof text !== 'string') return null;
  for (const def of COLOR_DEFINITIONS) {
    if (def.regex.test(text)) return def;
  }
  return null;
}

function getFileWithColor(file, colorName) {
  if (!file || !colorName) return file;
  const safeColor = colorName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dotIdx = file.name.lastIndexOf('.');
  const ext = dotIdx >= 0 ? file.name.substring(dotIdx) : '.webp';
  const baseName = dotIdx >= 0 ? file.name.substring(0, dotIdx) : file.name;
  if (baseName.toLowerCase().includes(safeColor)) return file;
  return new File([file], `${baseName}_${safeColor}${ext}`, { type: file.type });
}

// Simulador de addProduct idéntico a StoreContext.jsx
async function simulateAddProduct(productData) {
  const activeColors = Array.isArray(productData.colors) && productData.colors.length > 0
    ? productData.colors
    : [productData.defaultColor || 'Negro'];

  let filesToUpload = [];
  if (Array.isArray(productData.imageItems)) {
    filesToUpload = productData.imageItems
      .filter(it => it && it.file instanceof File)
      .map(it => ({
        file: it.file,
        color: it.color || productData.defaultColor || activeColors[0] || 'Negro'
      }));
  }

  const fd = new FormData();
  fd.append('name', productData.name.trim().toUpperCase());
  fd.append('description', productData.description || '');
  fd.append('price', String(productData.price));
  fd.append('category', productData.category || 'poleras');
  fd.append('badge', productData.badge || 'NUEVO');
  fd.append('stock', String(productData.stock || 10));
  fd.append('sizeStock', JSON.stringify(productData.sizeStock || {}));
  fd.append('gender', 'Unisex');
  fd.append('sku', productData.sku || 'TEST-SKU');
  fd.append('gsm', '240 GSM Algodón Pesado');
  fd.append('fit', 'Corte Regular');
  fd.append('specs', JSON.stringify(['100% Algodón', 'Serigrafía']));
  fd.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL']));
  fd.append('isFeatured', 'true');
  fd.append('colors', JSON.stringify(activeColors));

  filesToUpload.forEach(item => {
    fd.append('images', getFileWithColor(item.file, item.color));
  });

  let pbRecord = await pb.collection('products').create(fd, { requestKey: null });

  if (pbRecord && Array.isArray(pbRecord.images) && pbRecord.images.length > 0) {
    const col = pbRecord.collectionId || pbRecord.collectionName || 'pbc_4092854851';
    const galleryWithColorObjects = pbRecord.images.map((img, idx) => {
      const fullUrl = `${PB_URL}/api/files/${col}/${pbRecord.id}/${img}`;
      const colorFromUpload = filesToUpload[idx]?.color;
      const colorFromFilename = detectColorFromText(img)?.name;
      const finalColor = colorFromUpload || colorFromFilename || (idx === 0 ? (productData.defaultColor || activeColors[0]) : null);
      return {
        url: fullUrl,
        color: finalColor
      };
    });

    const targetDefaultColor = productData.defaultColor || activeColors[0];
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

    pbRecord = await pb.collection('products').update(pbRecord.id, {
      image: mainImg,
      gallery: galleryWithColorObjects,
      colors: activeColors
    }, { requestKey: null });
  }

  return pbRecord;
}

async function run() {
  console.log('--- TEST DE SIMULACIÓN DE FLUJO ADMIN DE PRODUCTOS ---');
  await pb.collection('_superusers').authWithPassword('contacto@patrianostradistro.cl', 'PatriaNostra2026!');
  console.log('✓ Autenticado en PocketBase como Superuser.');

  const baseImagePath = path.resolve(__dirname, '../public/producto.webp');
  const buffer = fs.readFileSync(baseImagePath);

  // PRUEBA 1: Subida "Normal" (1 solo color Negro, usuario sube foto desde PC)
  console.log('\n[TEST 1] Subida "Normal" (1 imagen principal, color Negro)...');
  const normalFile = new File([buffer], 'polera_combate_normal.webp', { type: 'image/webp' });
  const normalPayload = {
    name: 'POLERA NORMAL TEST ADMIN',
    price: 15000,
    category: 'poleras',
    stock: 12,
    sizeStock: { 'S': 3, 'M': 3, 'L': 3, 'XL': 3 },
    colors: ['Negro'],
    defaultColor: 'Negro',
    imageItems: [
      { id: '1', file: normalFile, url: 'blob:http://localhost:5173/preview-blob-1', color: 'Negro' }
    ]
  };

  const recNormal = await simulateAddProduct(normalPayload);
  console.log('✓ Record Creado:', recNormal.id);
  console.log('  - image guardada:', recNormal.image);
  console.log('  - images en PB:', recNormal.images);
  console.log('  - gallery en PB:', recNormal.gallery);

  if (recNormal.image.includes('/producto.webp') || recNormal.image.startsWith('blob:')) {
    throw new Error('FALLA: La imagen guardada sigue siendo placeholder o blob!');
  }
  console.log('✓ TEST 1 PASADO: La imagen principal es una URL real de PocketBase.');

  // PRUEBA 2: Subida Multicolores (Negro, Blanco, Burdeo)
  console.log('\n[TEST 2] Subida Multi-color (3 fotos, variantes Negro, Blanco, Burdeo)...');
  const fileNegro = new File([buffer], 'polera_negra.webp', { type: 'image/webp' });
  const fileBlanco = new File([buffer], 'polera_blanca.webp', { type: 'image/webp' });
  const fileBurdeo = new File([buffer], 'polera_burdeo.webp', { type: 'image/webp' });

  const multiPayload = {
    name: 'POLERA MULTICOLOR TEST ADMIN',
    price: 18000,
    category: 'poleras',
    stock: 18,
    sizeStock: { 'S': 6, 'M': 6, 'L': 6 },
    colors: ['Negro', 'Blanco', 'Burdeo'],
    defaultColor: 'Negro',
    imageItems: [
      { id: '1', file: fileNegro, url: 'blob:http://localhost:5173/preview-negro', color: 'Negro' },
      { id: '2', file: fileBlanco, url: 'blob:http://localhost:5173/preview-blanco', color: 'Blanco' },
      { id: '3', file: fileBurdeo, url: 'blob:http://localhost:5173/preview-burdeo', color: 'Burdeo' }
    ]
  };

  const recMulti = await simulateAddProduct(multiPayload);
  console.log('✓ Record Creado:', recMulti.id);
  console.log('  - image guardada:', recMulti.image);
  console.log('  - images en PB:', recMulti.images);
  console.log('  - gallery en PB:', recMulti.gallery);

  if (recMulti.image.includes('/producto.webp') || recMulti.image.startsWith('blob:')) {
    throw new Error('FALLA: La imagen guardada en multi-color sigue siendo placeholder o blob!');
  }

  // Verificar que cada foto responda 200 OK vía HTTP
  console.log('\n[VERIFICACIÓN HTTP]');
  const res1 = await fetch(recNormal.image);
  console.log(`- GET Test Normal Image (${recNormal.image.slice(-35)}): HTTP ${res1.status}`);
  const res2 = await fetch(recMulti.image);
  console.log(`- GET Test Multi Image (${recMulti.image.slice(-35)}): HTTP ${res2.status}`);

  if (res1.status === 200 && res2.status === 200) {
    console.log('\n>>> TODAS LAS PRUEBAS EN PRODUCCIÓN HAN SIDO COMPLETADAS CON ÉXITO Y 200 OK! <<<');
  } else {
    throw new Error(`Fallo HTTP: res1=${res1.status}, res2=${res2.status}`);
  }

  // Limpiar los 2 productos de prueba para no ensuciar la tienda
  console.log('\nLimpiando registros de prueba...');
  await pb.collection('products').delete(recNormal.id);
  await pb.collection('products').delete(recMulti.id);
  console.log('✓ Registros temporales eliminados.');
}

run().catch(err => {
  console.error('ERROR EN TEST:', err);
  process.exit(1);
});
