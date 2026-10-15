import PocketBase from 'pocketbase';
import https from 'node:https';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(POCKETBASE_URL);

const COLOR_DEFINITIONS = [
  { name: 'Negro', regex: /negr[oa]/i },
  { name: 'Blanco', regex: /blanc[oa]/i },
  { name: 'Azul', regex: /azul/i },
  { name: 'Burdeo', regex: /burdeo|bordo|vino/i },
  { name: 'Gris', regex: /gris|plomo|melange/i },
  { name: 'Rojo', regex: /roj[oa]/i },
  { name: 'Verde Militar', regex: /verd[ea]|militar/i },
  { name: 'Amarillo', regex: /amarill[oa]/i }
];

function detectColor(text) {
  if (!text || typeof text !== 'string') return null;
  for (const c of COLOR_DEFINITIONS) {
    if (c.regex.test(text)) return c.name;
  }
  return null;
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Error ${res.statusCode} descargando ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function getRemoteFileSize(url) {
  return new Promise(resolve => {
    https.request(url, { method: 'HEAD' }, res => {
      const len = parseInt(res.headers['content-length'] || '0', 10);
      resolve(len);
    }).on('error', () => resolve(0)).end();
  });
}

async function main() {
  console.log('🚀 Iniciando optimización masiva de imágenes en PocketBase...');
  console.log('📡 Conectando a:', POCKETBASE_URL);

  await pb.collection('_superusers').authWithPassword(
    'contacto@patrianostradistro.cl',
    'PatriaNostra2026!'
  );
  console.log('✅ Autenticado como superusuario en PocketBase.');

  // Asegurar que las miniaturas soportadas estén en la colección
  const col = await pb.collections.getOne('products');
  const imagesField = col.fields.find(f => f.name === 'images');
  if (imagesField) {
    imagesField.thumbs = ['100x100', '300x300', '500x500', '800x800'];
    await pb.collections.update(col.id, col);
    console.log('✅ Configuración de miniaturas en PocketBase actualizada: [100x100, 300x300, 500x500, 800x800]');
  }

  const products = await pb.collection('products').getFullList({
    sort: '-created,-@rowid'
  });
  console.log(`📦 Se encontraron ${products.length} productos en la base de datos.`);

  let totalSavedBytes = 0;
  let totalOptimizedImages = 0;
  let processedProducts = 0;

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const p = products[pIdx];
    const colId = p.collectionId || 'pbc_4092854851';
    const images = Array.isArray(p.images) ? p.images : [];

    if (images.length === 0) {
      console.log(`[${pIdx + 1}/${products.length}] ⏭️ "${p.name}" no tiene imágenes.`);
      continue;
    }

    // Comprobar si tiene alguna imagen pesada (> 200 KB)
    let needsOptimization = false;
    const sizes = [];
    for (const imgName of images) {
      const imgUrl = `${POCKETBASE_URL}/api/files/${colId}/${p.id}/${imgName}`;
      const size = await getRemoteFileSize(imgUrl);
      sizes.push({ imgName, size, url: imgUrl });
      if (size > 200 * 1024) {
        needsOptimization = true;
      }
    }

    if (!needsOptimization) {
      console.log(`[${pIdx + 1}/${products.length}] ⚡ "${p.name}" ya está optimizado (todas <200KB).`);
      continue;
    }

    console.log(`[${pIdx + 1}/${products.length}] 🔨 Optimizando "${p.name}" (${images.length} fotos)...`);

    // Parsear galería actual para preservar colores asignados
    let existingGallery = p.gallery;
    if (typeof existingGallery === 'string') {
      try { existingGallery = JSON.parse(existingGallery); } catch { existingGallery = []; }
    }
    if (!Array.isArray(existingGallery)) existingGallery = [];

    const filesToUpload = [];
    const colorAssignments = [];

    for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
      const imgName = images[imgIdx];
      const imgUrl = `${POCKETBASE_URL}/api/files/${colId}/${p.id}/${imgName}`;

      try {
        const rawBuffer = await downloadBuffer(imgUrl);
        const originalKb = Math.round(rawBuffer.length / 1024);

        let webpBuffer;
        if (rawBuffer.length > 200 * 1024) {
          webpBuffer = await sharp(rawBuffer)
            .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toBuffer();
          const newKb = Math.round(webpBuffer.length / 1024);
          const saved = rawBuffer.length - webpBuffer.length;
          totalSavedBytes += saved;
          totalOptimizedImages++;
          console.log(`   📸 Foto ${imgIdx + 1}: ${originalKb} KB ➔ ${newKb} KB (-${Math.round((saved / rawBuffer.length) * 100)}%)`);
        } else {
          webpBuffer = rawBuffer;
          console.log(`   📸 Foto ${imgIdx + 1}: ${originalKb} KB (conservada)`);
        }

        // Determinar color
        let assignedColor = null;
        // 1. Revisar si ya venía en existingGallery con color
        for (const item of existingGallery) {
          if (item && typeof item === 'object' && item.url && item.url.includes(imgName)) {
            assignedColor = item.color;
            break;
          }
        }
        // 2. Si no, detectar del nombre de archivo
        if (!assignedColor) {
          assignedColor = detectColor(imgName);
        }
        // 3. Si sigue sin color y es la primera foto, asignar Negro
        if (!assignedColor && imgIdx === 0) {
          assignedColor = 'Negro';
        }

        colorAssignments.push(assignedColor);

        // Nombre limpio
        const base = imgName.replace(/\.[^/.]+$/, '').replace(/_[a-z0-9]{10}$/, '');
        const cleanName = `${base}.webp`;

        filesToUpload.push(new File([webpBuffer], cleanName, { type: 'image/webp' }));
      } catch (err) {
        console.warn(`   ⚠️ Error procesando ${imgName}:`, err.message);
      }
    }

    if (filesToUpload.length === 0) continue;

    // Subir a PocketBase
    const fd = new FormData();
    filesToUpload.forEach(f => fd.append('images', f));

    try {
      const updatedRecord = await pb.collection('products').update(p.id, fd);

      // Reconstruir gallery con los nuevos nombres de archivo generados por PocketBase
      const galleryWithColorObjects = (updatedRecord.images || []).map((newImg, idx) => {
        return {
          url: `${POCKETBASE_URL}/api/files/${colId}/${updatedRecord.id}/${newImg}`,
          color: colorAssignments[idx] || null
        };
      });

      const mainImg = galleryWithColorObjects[0]?.url || '/producto.webp';

      await pb.collection('products').update(p.id, {
        image: mainImg,
        gallery: galleryWithColorObjects
      });

      processedProducts++;
      console.log(`   ✅ "${p.name}" actualizado exitosamente con ${galleryWithColorObjects.length} fotos optimizadas.`);
    } catch (updateErr) {
      console.error(`   ❌ Error guardando "${p.name}":`, updateErr.message);
    }
  }

  const savedMb = Math.round(totalSavedBytes / (1024 * 1024));
  console.log('\n======================================================');
  console.log(`🎉 OPTIMIZACIÓN COMPLETADA CON ÉXITO:`);
  console.log(`📦 Productos procesados: ${processedProducts}`);
  console.log(`📸 Imágenes convertidas a WebP: ${totalOptimizedImages}`);
  console.log(`💾 Espacio total ahorrado: ~${savedMb} Megabytes`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('❌ Error fatal en proceso de optimización:', err);
  process.exit(1);
});
