import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { products } from '../src/data/products.js';

async function prewarm() {
  const cacheDir = path.resolve(process.cwd(), '.cache', 'pocketbase-images');
  fs.mkdirSync(cacheDir, { recursive: true });

  console.log('🚀 Pre-calentando la caché local de imágenes de Vite...');
  console.log(`📁 Directorio de caché: ${cacheDir}`);

  const urls = new Set();
  for (const p of products) {
    if (p.image && p.image.includes('/api/files/')) urls.add(p.image);
    for (const img of (p.images || [])) {
      if (img && img.includes('/api/files/')) urls.add(img);
    }
  }

  const urlList = Array.from(urls);
  console.log(`📦 Encontradas ${urlList.length} imágenes únicas en el catálogo.`);

  let cachedCount = 0;
  let downloadedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urlList.length; i++) {
    const fullUrl = urlList[i];
    const urlObj = new URL(fullUrl);
    const pathname = urlObj.pathname.replace(/\/$/, '');
    const querySuffix = urlObj.search ? '_' + urlObj.search.replace(/[^a-zA-Z0-9]/g, '_') : '';
    const safeKey = pathname.replace(/^\/api\/files\//, '').replace(/[^a-zA-Z0-9._-]/g, '_') + querySuffix + '.webp';
    const filePath = path.join(cacheDir, safeKey);

    if (fs.existsSync(filePath)) {
      cachedCount++;
      continue;
    }

    try {
      const res = await fetch(fullUrl);
      if (!res.ok) {
        console.warn(`[${i+1}/${urlList.length}] ⚠️ HTTP ${res.status} para ${fullUrl}`);
        errorCount++;
        continue;
      }

      const raw = Buffer.from(await res.arrayBuffer());
      let finalBuffer = raw;

      // Optimizar si supera 30 KB
      if (raw.length > 30 * 1024) {
        try {
          finalBuffer = await sharp(raw)
            .resize({ width: 650, height: 650, fit: 'inside', withoutEnlargement: true })
            .flatten({ background: { r: 5, g: 5, b: 5 } })
            .webp({ quality: 68, effort: 6 })
            .toBuffer();
        } catch {
          finalBuffer = raw;
        }
      }

      fs.writeFileSync(filePath, finalBuffer);
      downloadedCount++;
      if (downloadedCount % 10 === 0 || downloadedCount === 1) {
        console.log(`[${i+1}/${urlList.length}] ⚡ Guardado en caché: ${safeKey} (${(finalBuffer.length/1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      console.warn(`[${i+1}/${urlList.length}] ❌ Error descargando ${fullUrl}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n🏁 Pre-calentamiento finalizado:');
  console.log(`   - En caché previo: ${cachedCount}`);
  console.log(`   - Nuevas descargadas y optimizadas: ${downloadedCount}`);
  console.log(`   - Errores: ${errorCount}`);
  console.log(`   - Total en disco: ${fs.readdirSync(cacheDir).length} imágenes`);
}

prewarm().catch(console.error);
