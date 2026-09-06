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

const OLD_PRODUCTS_TO_REMOVE = [
  'POLERÓN PATRIA NOSTRA',
  'CAMISETA PATRIA NOSTRA',
  'CAMISETA KRONSTADT',
  'POLERÓN NO GLORY'
];

const NEW_FEATURED_PRODUCTS = [
  { name: 'POLERA ANTISOCIAL', badge: 'DESTACADO' },
  { name: 'POLERA 7 MUELLES', badge: 'EDICIÓN LIMITADA' },
  { name: 'POLERA BOUND FOR GLORY', badge: 'DESTACADO' },
  { name: 'POLERA ULTIMA THULE', badge: 'EDICIÓN LIMITADA' },
  { name: 'POLERA BRUTAL ATTACK 1980', badge: 'NUEVO' },
  { name: 'POLERA DEFENDER SKINHEAD', badge: 'DESTACADO' },
  { name: 'POLERA BATTLEZONE', badge: 'NUEVO' },
  { name: 'POLERA DIVISION 250', badge: 'EDICIÓN LIMITADA' }
];

async function run() {
  console.log('🔄 Conectando a PocketBase...');
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);

  // 1. Eliminar polerones y camisetas antiguas de PocketBase
  const existing = await pb.collection('products').getFullList();
  console.log(`Total productos en PocketBase actualmente: ${existing.length}`);

  for (const item of existing) {
    if (OLD_PRODUCTS_TO_REMOVE.some(name => item.name.trim().toUpperCase() === name)) {
      console.log(`🗑️ Eliminando de PocketBase: "${item.name}" (ID: ${item.id})...`);
      await pb.collection('products').delete(item.id);
      console.log(`✅ Eliminado: ${item.name}`);
    }
  }

  // 2. Marcar las prendas seleccionadas como destacadas en PocketBase
  for (const feat of NEW_FEATURED_PRODUCTS) {
    const record = existing.find(p => p.name.trim().toUpperCase() === feat.name);
    if (record) {
      console.log(`⭐ Destacando en PocketBase: "${record.name}" con badge "${feat.badge}"...`);
      await pb.collection('products').update(record.id, {
        isFeatured: true,
        badge: feat.badge
      });
      console.log(`✅ Destacado: ${record.name}`);
    }
  }

  // 3. Actualizar catálogo local en src/data/products.js
  const productsJsPath = path.join(rootDir, 'src', 'data', 'products.js');
  const { products, collaborations } = await import('../src/data/products.js');

  // Filtrar los productos antiguos
  const filteredProducts = products.filter(p => {
    return !OLD_PRODUCTS_TO_REMOVE.some(name => p.name.trim().toUpperCase() === name);
  });

  // Aplicar destacados
  const updatedProducts = filteredProducts.map(p => {
    const featMatch = NEW_FEATURED_PRODUCTS.find(f => f.name === p.name.trim().toUpperCase());
    if (featMatch) {
      return {
        ...p,
        isFeatured: true,
        badge: featMatch.badge
      };
    }
    return p;
  });

  const fileContent = `export const products = ${JSON.stringify(updatedProducts, null, 2)};\n\nexport const collaborations = ${JSON.stringify(collaborations, null, 2)};\n`;
  fs.writeFileSync(productsJsPath, fileContent, 'utf-8');
  console.log(`✅ src/data/products.js actualizado. Total productos restantes: ${updatedProducts.length}`);
}

run().catch(console.error);
