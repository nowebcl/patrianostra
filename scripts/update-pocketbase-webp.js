import PocketBase from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const POCKETBASE_URL = 'https://pn.noweb.tech';
const SUPERUSER_EMAIL = 'contacto@patrianostradistro.cl';
const SUPERUSER_PASS = 'PatriaNostra2026!';

async function updatePbToWebp() {
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);

  const records = await pb.collection('products').getFullList();
  console.log(`Total productos en PocketBase: ${records.length}`);

  const dir1x = path.join(rootDir, 'public', '1x');
  const webpFiles1x = fs.readdirSync(dir1x).filter(f => f.endsWith('.webp'));

  let updated = 0;

  for (const r of records) {
    if (r.name.startsWith('POLERA')) {
      const cleanName = r.name.replace(/^POLERA\s+/, '').trim().toLowerCase();
      const matched = webpFiles1x.find(f => {
        const base = f.replace(/\.webp$/i, '').trim().toLowerCase();
        return cleanName === base || cleanName.replace(/\s+/g, '') === base.replace(/\s+/g, '');
      });

      if (matched) {
        const filePath = path.join(dir1x, matched);
        const data = fs.readFileSync(filePath);
        const blob = new Blob([data], { type: 'image/webp' });
        const formData = new FormData();
        formData.append('images', blob, matched);

        await pb.collection('products').update(r.id, formData);
        updated++;
        console.log(`[${updated}] Actualizado ${r.name} con ${matched} (${(data.length / 1024).toFixed(1)} KB)`);
      }
    } else {
      // También optimizar producto base si tiene producto.webp
      const prodWebpPath = path.join(rootDir, 'public', 'producto.webp');
      if (fs.existsSync(prodWebpPath)) {
        const data = fs.readFileSync(prodWebpPath);
        const blob = new Blob([data], { type: 'image/webp' });
        const formData = new FormData();
        formData.append('images', blob, 'producto.webp');
        await pb.collection('products').update(r.id, formData);
        updated++;
        console.log(`[${updated}] Actualizado producto base ${r.name} con producto.webp (${(data.length / 1024).toFixed(1)} KB)`);
      }
    }
  }

  console.log(`\n🎉 Finalizada actualización a WebP en PocketBase. Total registros actualizados: ${updated}`);
}

updatePbToWebp().catch(console.error);
