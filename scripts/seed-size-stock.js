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

async function seedSizeStock() {
  console.log('📦 Conectando a PocketBase para sembrar stock por talla...');
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);

  const records = await pb.collection('products').getFullList();
  console.log(`Total productos en PocketBase: ${records.length}`);

  const distributionPreset = {
    'S': 3,
    'M': 6,
    'L': 7,
    'XL': 4,
    'XXL': 2
  };

  for (const r of records) {
    let sizes = r.sizes;
    if (typeof sizes === 'string') {
      try { sizes = JSON.parse(sizes); } catch { sizes = ['S', 'M', 'L', 'XL', 'XXL']; }
    }
    if (!Array.isArray(sizes) || sizes.length === 0) {
      sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    }

    let sizeStock = {};
    if (sizes.length === 1 && (sizes[0] === 'Única' || sizes[0] === 'UNICA')) {
      sizeStock = { [sizes[0]]: r.stock || 25 };
    } else {
      // Distribute realistically
      sizes.forEach(sz => {
        sizeStock[sz] = distributionPreset[sz] !== undefined ? distributionPreset[sz] : 4;
      });
    }

    const totalStock = Object.values(sizeStock).reduce((a, b) => a + b, 0);

    await pb.collection('products').update(r.id, {
      sizeStock,
      stock: totalStock,
      sizes
    });
    console.log(`✅ ${r.name} -> Stock por talla:`, sizeStock, `(Total: ${totalStock})`);
  }

  // Actualizar también src/data/products.js
  const productsJsPath = path.join(rootDir, 'src', 'data', 'products.js');
  const { products, collaborations } = await import('../src/data/products.js');

  const updatedProducts = products.map(p => {
    const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
    let sizeStock = {};
    if (sizes.length === 1 && (sizes[0] === 'Única' || sizes[0] === 'UNICA')) {
      sizeStock = { [sizes[0]]: p.stock || 25 };
    } else {
      sizes.forEach(sz => {
        sizeStock[sz] = distributionPreset[sz] !== undefined ? distributionPreset[sz] : 4;
      });
    }
    const totalStock = Object.values(sizeStock).reduce((a, b) => a + b, 0);
    return {
      ...p,
      sizes,
      sizeStock,
      stock: totalStock
    };
  });

  const fileContent = `export const products = ${JSON.stringify(updatedProducts, null, 2)};\n\nexport const collaborations = ${JSON.stringify(collaborations, null, 2)};\n`;
  fs.writeFileSync(productsJsPath, fileContent, 'utf-8');
  console.log(`🎉 src/data/products.js actualizado con sizeStock para todos los productos.`);
}

seedSizeStock().catch(console.error);
