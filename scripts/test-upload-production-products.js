import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(PB_URL);

// Definiciones de color para verificación
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

async function run() {
  console.log('1. Autenticando en PocketBase superuser...');
  await pb.collection('_superusers').authWithPassword('contacto@patrianostradistro.cl', 'PatriaNostra2026!');
  console.log('✓ Autenticación exitosa.');

  // Usar buffer de producto.webp como imagen base para las variantes
  const baseImagePath = path.resolve(__dirname, '../public/producto.webp');
  if (!fs.existsSync(baseImagePath)) {
    throw new Error('No se encontró public/producto.webp');
  }
  const baseImageBuffer = fs.readFileSync(baseImagePath);

  // PRODUCTO 1: POLERA COMBATE SUR (Negro, Blanco, Azul)
  console.log('\n2. Creando Producto 1: "POLERA COMBATE SUR - EDICIÓN 3 COLORES"...');
  const fd1 = new FormData();
  fd1.append('name', 'POLERA COMBATE SUR - EDICIÓN 3 COLORES');
  fd1.append('description', 'Polera oficial de alta densidad 240 GSM. Confeccionada con estampados curados al horno y disponible en tres variantes de color oficiales: Negro, Blanco y Azul.');
  fd1.append('price', '14990');
  fd1.append('originalPrice', '19990');
  fd1.append('category', 'poleras');
  fd1.append('badge', 'NUEVO');
  fd1.append('stock', '24');
  fd1.append('sizeStock', JSON.stringify({ 'S': 6, 'M': 6, 'L': 6, 'XL': 6 }));
  fd1.append('gender', 'Unisex');
  fd1.append('sku', 'PN-POL-SUR3');
  fd1.append('gsm', '240 GSM Algodón Pesado');
  fd1.append('fit', 'Corte Regular');
  fd1.append('specs', JSON.stringify(['100% Algodón Peinado 240 GSM', 'Estampado serigráfico de máxima resistencia', 'Costuras reforzadas en cuello y hombros']));
  fd1.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL']));
  fd1.append('colors', JSON.stringify(['Negro', 'Blanco', 'Azul']));
  fd1.append('isFeatured', 'true');
  fd1.append('image', '/producto.webp');
  fd1.append('gallery', JSON.stringify(['/producto.webp']));

  // Adjuntar archivos con nombres representativos de cada color
  fd1.append('images', new Blob([baseImageBuffer], { type: 'image/webp' }), 'polera_sur_negro.webp');
  fd1.append('images', new Blob([baseImageBuffer], { type: 'image/webp' }), 'polera_sur_blanco.webp');
  fd1.append('images', new Blob([baseImageBuffer], { type: 'image/webp' }), 'polera_sur_azul.webp');

  const rec1 = await pb.collection('products').create(fd1, { requestKey: null });
  console.log(`✓ Registro 1 creado en PocketBase con ID: ${rec1.id}`);

  // Auto-vincular variantes de colores en rec1
  const col1 = rec1.collectionId || rec1.collectionName || 'pbc_4092854851';
  const gallery1 = rec1.images.map((img, idx) => {
    const fullUrl = `${PB_URL}/api/files/${col1}/${rec1.id}/${img}`;
    const detected = detectColorFromText(img)?.name;
    const assignedColor = idx === 0 ? 'Negro' : idx === 1 ? 'Blanco' : 'Azul';
    return {
      url: fullUrl,
      color: detected || assignedColor
    };
  });

  const updatedRec1 = await pb.collection('products').update(rec1.id, {
    image: gallery1[0].url,
    gallery: gallery1,
    colors: ['Negro', 'Blanco', 'Azul']
  }, { requestKey: null });
  console.log(`✓ Galería y variantes de color vinculadas para Producto 1.`);


  // PRODUCTO 2: POLERÓN PATRIA PESADO (Burdeo, Negro)
  console.log('\n3. Creando Producto 2: "POLERÓN PATRIA PESADO - BURDEO & NEGRO"...');
  const fd2 = new FormData();
  fd2.append('name', 'POLERÓN PATRIA PESADO - BURDEO & NEGRO');
  fd2.append('description', 'Polerón hoodie premium confeccionado en frisa pesada de 380 GSM con capucha forrada y bolsillo canguro reforzado. Variantes en Burdeo y Negro clásico.');
  fd2.append('price', '29990');
  fd2.append('originalPrice', '35990');
  fd2.append('category', 'polerones');
  fd2.append('badge', 'LIMITED');
  fd2.append('stock', '18');
  fd2.append('sizeStock', JSON.stringify({ 'M': 6, 'L': 6, 'XL': 6 }));
  fd2.append('gender', 'Unisex');
  fd2.append('sku', 'PN-HLD-BN');
  fd2.append('gsm', '380 GSM Frisa Pesada');
  fd2.append('fit', 'Oversize Fit');
  fd2.append('specs', JSON.stringify(['Frisa pesada 380 GSM', 'Bolsillo canguro y capucha con cordón plano', 'Estampado en espalda de alta densidad']));
  fd2.append('sizes', JSON.stringify(['M', 'L', 'XL']));
  fd2.append('colors', JSON.stringify(['Burdeo', 'Negro']));
  fd2.append('isFeatured', 'true');
  fd2.append('image', '/producto.webp');
  fd2.append('gallery', JSON.stringify(['/producto.webp']));

  fd2.append('images', new Blob([baseImageBuffer], { type: 'image/webp' }), 'hoodie_patria_burdeo.webp');
  fd2.append('images', new Blob([baseImageBuffer], { type: 'image/webp' }), 'hoodie_patria_negro.webp');

  const rec2 = await pb.collection('products').create(fd2, { requestKey: null });
  console.log(`✓ Registro 2 creado en PocketBase con ID: ${rec2.id}`);

  const col2 = rec2.collectionId || rec2.collectionName || 'pbc_4092854851';
  const gallery2 = rec2.images.map((img, idx) => {
    const fullUrl = `${PB_URL}/api/files/${col2}/${rec2.id}/${img}`;
    const detected = detectColorFromText(img)?.name;
    const assignedColor = idx === 0 ? 'Burdeo' : 'Negro';
    return {
      url: fullUrl,
      color: detected || assignedColor
    };
  });

  const updatedRec2 = await pb.collection('products').update(rec2.id, {
    image: gallery2[0].url,
    gallery: gallery2,
    colors: ['Burdeo', 'Negro']
  }, { requestKey: null });
  console.log(`✓ Galería y variantes de color vinculadas para Producto 2.`);

  // 4. Verificación de lectura pública
  console.log('\n4. Verificando lectura y disponibilidad de imágenes en producción...');
  const testUrls = [
    gallery1[0].url,
    gallery1[1].url,
    gallery1[2].url,
    gallery2[0].url,
    gallery2[1].url
  ];

  for (const url of testUrls) {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(` - ${url}: Status ${res.status} (${res.headers.get('content-type')}, ${res.headers.get('content-length')} bytes)`);
    if (res.status !== 200) {
      throw new Error(`Fallo de lectura en URL: ${url}`);
    }
  }

  console.log('\n=============================================');
  console.log('✓ PRUEBA EN PRODUCCIÓN EXITOSA AL 100%');
  console.log(`Producto 1: ${updatedRec1.name} (ID: ${updatedRec1.id})`);
  console.log(`  Colores: ${JSON.stringify(updatedRec1.colors)}`);
  console.log(`  Fotos: ${updatedRec1.images.length} archivos WebP vinculados.`);
  console.log(`Producto 2: ${updatedRec2.name} (ID: ${updatedRec2.id})`);
  console.log(`  Colores: ${JSON.stringify(updatedRec2.colors)}`);
  console.log(`  Fotos: ${updatedRec2.images.length} archivos WebP vinculados.`);
  console.log('=============================================');
}

run().catch(err => {
  console.error('ERROR EN PRUEBA:', err);
  process.exit(1);
});
