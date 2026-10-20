import PocketBase from 'pocketbase';
import sharp from 'sharp';
import crypto from 'node:crypto';

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(POCKETBASE_URL);

async function main() {
  console.log('================================================================');
  console.log('🧪 PRUEBA E2E: SUBIDA DE IMAGEN DE ~5 MB + CATEGORÍA MÚSICA/VINILOS');
  console.log('================================================================');

  // 1. Autenticar en PocketBase
  await pb.collection('_superusers').authWithPassword(
    'contacto@patrianostradistro.cl',
    'PatriaNostra2026!'
  );
  console.log('✅ 1. Autenticado en PocketBase.');

  // 2. Generar una imagen PNG de alta resolución de ~5.2 MB reales (con ruido visual y canal alfa)
  const width = 2200;
  const height = 2200;
  // Crear un buffer con gradiente + textura de grano para que el PNG pese ~5 MB
  const rawPixels = Buffer.alloc(width * height * 4);
  const randomChunk = crypto.randomBytes(1024 * 64);
  for (let i = 0; i < rawPixels.length; i += 4) {
    const pxIdx = i / 4;
    const x = pxIdx % width;
    const y = Math.floor(pxIdx / width);
    const dx = x - width / 2;
    const dy = y - height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const noise = randomChunk[i % randomChunk.length];

    if (dist < 900) {
      // Diseño de vinilo rojo/negro en el centro
      const isLabel = dist < 300;
      const isHole = dist < 45;
      if (isHole) {
        rawPixels[i] = 5;
        rawPixels[i + 1] = 5;
        rawPixels[i + 2] = 5;
        rawPixels[i + 3] = 255;
      } else if (isLabel) {
        rawPixels[i] = 197;     // Rojo Patria Nostra (#C52222)
        rawPixels[i + 1] = 34 + (noise % 25);
        rawPixels[i + 2] = 34 + (noise % 25);
        rawPixels[i + 3] = 255;
      } else {
        // Surcos del vinilo con textura detallada
        const groove = Math.sin(dist * 0.25) * 18;
        const val = Math.max(10, Math.min(60, 22 + groove + (noise % 35)));
        rawPixels[i] = val;
        rawPixels[i + 1] = val;
        rawPixels[i + 2] = val;
        rawPixels[i + 3] = 255;
      }
    } else {
      // Fondo transparente con ruido sutil para alcanzar ~5 MB en PNG original
      rawPixels[i] = noise;
      rawPixels[i + 1] = (noise * 3) % 256;
      rawPixels[i + 2] = (noise * 7) % 256;
      rawPixels[i + 3] = 0;
    }
  }

  const heavyPngBuffer = await sharp(rawPixels, {
    raw: { width, height, channels: 4 }
  })
    .png({ compressionLevel: 1 })
    .toBuffer();

  const heavySizeKb = Math.round(heavyPngBuffer.length / 1024);
  const heavySizeMb = (heavyPngBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`📸 2. Imagen de prueba generada: ${width}x${height}px PNG | Peso original: ${heavySizeMb} MB (${heavySizeKb} KB)`);

  // 3. Ejecutar el algoritmo de optimización (800x800, flatten #050505, WebP q=78)
  const startOpt = Date.now();
  const optimizedWebpBuffer = await sharp(heavyPngBuffer)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 5, g: 5, b: 5 } })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();
  const optTimeMs = Date.now() - startOpt;
  const optSizeKb = Math.round(optimizedWebpBuffer.length / 1024);
  const reductionPct = (((heavyPngBuffer.length - optimizedWebpBuffer.length) / heavyPngBuffer.length) * 100).toFixed(1);

  console.log(`⚡ 3. Imagen optimizada a WebP: ${optSizeKb} KB en ${optTimeMs}ms (Reducción del ${reductionPct}%)`);

  // 4. Eliminar cualquier producto de prueba anterior con SKU PN-VIN-5MB
  const existingTests = await pb.collection('products').getFullList({
    filter: 'sku = "PN-VIN-5MB"'
  });
  for (const old of existingTests) {
    await pb.collection('products').delete(old.id);
  }

  // 5. Subir el producto nuevo de prueba en categoría "vinilos"
  const fd = new FormData();
  fd.append('name', 'VINILO TEST 5MB (CARGA ULTRA RÁPIDA WEBP)');
  fd.append('description', `Producto de prueba creado con una imagen original de ${heavySizeMb} MB (${heavySizeKb} KB) convertida automáticamente a WebP de solo ${optSizeKb} KB. Categoría: Vinilos / Música.`);
  fd.append('price', '22000');
  fd.append('category', 'vinilos');
  fd.append('badge', 'VINILO TEST 5MB');
  fd.append('stock', '10');
  fd.append('sizeStock', JSON.stringify({ 'Única': 10 }));
  fd.append('gender', 'Unisex');
  fd.append('sku', 'PN-VIN-5MB');
  fd.append('gsm', 'Edición Física Oficial');
  fd.append('fit', 'VINILOS');
  fd.append('specs', JSON.stringify([
    `Imagen original de entrada: ${heavySizeMb} MB (${heavySizeKb} KB)`,
    `Imagen WebP almacenada: ${optSizeKb} KB (-${reductionPct}%)`,
    'Formato: Vinilo 12" LP Edición Limitada'
  ]));
  fd.append('sizes', JSON.stringify(['Única']));
  fd.append('isFeatured', 'false');
  fd.append('colors', JSON.stringify(['Negro']));

  const webpFile = new File([optimizedWebpBuffer], 'vinilo_test_5mb_negro.webp', { type: 'image/webp' });
  fd.append('images', webpFile);

  let created = await pb.collection('products').create(fd);
  const colId = created.collectionId || 'pbc_4092854851';
  const uploadedImgName = created.images[0];
  const fullImgUrl = `${POCKETBASE_URL}/api/files/${colId}/${created.id}/${uploadedImgName}`;

  created = await pb.collection('products').update(created.id, {
    image: fullImgUrl,
    gallery: [{ url: fullImgUrl, color: 'Negro' }],
    colors: ['Negro']
  });

  console.log(`✅ 4. Producto creado en PocketBase: ID=${created.id} | Categoría="${created.category}"`);
  console.log(`🔗    URL de imagen: ${fullImgUrl}`);

  // 6. Verificar descarga en frío (Cache-Control: no-cache, Pragma: no-cache + cachebuster)
  const bustUrl = `${fullImgUrl}?nocache=${Date.now()}`;
  const startFetch = Date.now();
  const res = await fetch(bustUrl, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  const downloadedBuf = Buffer.from(await res.arrayBuffer());
  const fetchTimeMs = Date.now() - startFetch;

  console.log('----------------------------------------------------------------');
  console.log(`🚀 5. VERIFICACIÓN DE DESCARGA SIN CACHÉ:`);
  console.log(`   • HTTP Status:    ${res.status}`);
  console.log(`   • Content-Type:   ${res.headers.get('content-type')}`);
  console.log(`   • Peso descargado: ${Math.round(downloadedBuf.length / 1024)} KB (antes: ${heavySizeKb} KB)`);
  console.log(`   • Tiempo total:   ${fetchTimeMs} ms`);
  console.log('================================================================');
}

main().catch(err => {
  console.error('❌ Error en prueba de 5MB:', err);
  process.exit(1);
});
