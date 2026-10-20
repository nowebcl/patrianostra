import PocketBase from 'pocketbase';
import https from 'node:https';
import sharp from 'sharp';
import fs from 'node:fs';

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

async function optimizeProducts(targetIds) {
  console.log('📡 Autenticando en PocketBase...');
  await pb.collection('_superusers').authWithPassword(
    'contacto@patrianostradistro.cl',
    'PatriaNostra2026!'
  );
  console.log('✅ Conectado.');

  for (const id of targetIds) {
    const p = await pb.collection('products').getOne(id);
    const colId = p.collectionId || 'pbc_4092854851';
    console.log(`\n🎯 Procesando: "${p.name}" (ID: ${p.id})`);

    let existingGallery = p.gallery;
    if (typeof existingGallery === 'string') {
      try { existingGallery = JSON.parse(existingGallery); } catch { existingGallery = []; }
    }
    if (!Array.isArray(existingGallery)) existingGallery = [];

    const images = Array.isArray(p.images) ? p.images : [];
    const filesToUpload = [];
    const colorAssignments = [];

    for (let i = 0; i < images.length; i++) {
      const imgName = images[i];
      const imgUrl = `${POCKETBASE_URL}/api/files/${colId}/${p.id}/${imgName}`;
      console.log(`   Descargando foto ${i + 1}: ${imgName}...`);
      const raw = await downloadBuffer(imgUrl);
      console.log(`   Tamaño actual: ${(raw.length / 1024).toFixed(1)} KB`);

      const compressed = await sharp(raw)
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: { r: 5, g: 5, b: 5 } })
        .webp({ quality: 68, effort: 6 })
        .toBuffer();

      console.log(`   ➔ Nuevo tamaño WebP optimizado: ${(compressed.length / 1024).toFixed(1)} KB (-${Math.round((1 - compressed.length / raw.length) * 100)}%)`);

      let assignedColor = null;
      for (const item of existingGallery) {
        if (item && typeof item === 'object' && item.url && item.url.includes(imgName)) {
          assignedColor = item.color;
          break;
        }
      }
      if (!assignedColor) assignedColor = detectColor(imgName);
      if (!assignedColor && i === 0) assignedColor = 'Negro';

      colorAssignments.push(assignedColor);

      const base = imgName.replace(/\.[^/.]+$/, '').replace(/_[a-z0-9]{10}$/, '');
      const cleanName = `${base}.webp`;
      filesToUpload.push(new File([compressed], cleanName, { type: 'image/webp' }));
    }

    if (filesToUpload.length > 0) {
      const fd = new FormData();
      filesToUpload.forEach(f => fd.append('images', f));
      console.log(`   ⬆️ Subiendo ${filesToUpload.length} imagen(es) optimizada(s)...`);
      const updated = await pb.collection('products').update(p.id, fd);

      const galleryObjects = (updated.images || []).map((newImg, idx) => ({
        url: `${POCKETBASE_URL}/api/files/${colId}/${updated.id}/${newImg}`,
        color: colorAssignments[idx] || null
      }));

      const mainImg = galleryObjects[0]?.url || '/producto.webp';
      await pb.collection('products').update(p.id, {
        image: mainImg,
        gallery: galleryObjects
      });
      console.log(`   ✅ "${p.name}" actualizado exitosamente.`);
    }
  }
}

// IDs to optimize: Balaclavas + recent products from screenshot
const TARGET_IDS = [
  's3uixooa4ml4e6y', // BALACLAVA TOTENKOPF
  'b8tvkg6ymxwfjgw', // BALACLAVA CRUZ CELTA EN LLAMAS
  'j8fs18pb1dgg6rq', // BALACLAVA ANTES MUERTO QUE TRAIDOR
  '5uyyis64dllnjg6', // REVUELTA CONTRA EL MUNDO MODERNO
  '7hfg6yamuwjyw3q', // DON´T WORRY BE HAPPY
  'gmiyiqs3ohmjvqg'  // DEFIENDE CHILE
];

optimizeProducts(TARGET_IDS)
  .then(() => console.log('\n🎉 ¡Todos los productos objetivo fueron optimizados a ~20KB!'))
  .catch(console.error);
