import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newProductsList } from './sync-1x-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const productsJsPath = path.join(rootDir, 'src', 'data', 'products.js');
let currentContent = fs.readFileSync(productsJsPath, 'utf-8');

const newProdsCode = newProductsList.map(p => {
  return `  {
    id: '${p.slug}',
    name: '${p.name}',
    price: 12000,
    originalPrice: null,
    image: '/1x/${p.file}',
    gallery: ['/1x/${p.file}'],
    badge: null,
    category: 'Poleras',
    gender: 'Unisex',
    stock: ${p.stock},
    sku: '${p.sku}',
    gsm: '240 GSM Algodón Pesado',
    fit: 'Corte Regular',
    description: '${p.desc.replace(/'/g, "\\'")}',
    specs: [
      '100% Algodón peinado de alto gramaje (240 GSM)',
      'Estampado serigráfico curado al horno de máxima resistencia',
      'Cuello acanalado de 3 cm reforzado con pespunte doble',
      'Costuras reforzadas en hombros y sisa para máxima durabilidad',
      'Prenda pre-encogida con calce estructurado'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: false
  }`;
}).join(',\n');

const splitMarker = 'export const collaborations = [';
const parts = currentContent.split(splitMarker);

if (parts.length === 2) {
  const lastBracketIndex = parts[0].lastIndexOf('];');
  const updatedFirstPart = parts[0].slice(0, lastBracketIndex) + ',\n' + newProdsCode + '\n];\n\n';
  const finalContent = updatedFirstPart + splitMarker + parts[1];
  fs.writeFileSync(productsJsPath, finalContent, 'utf-8');
  console.log('✅ src/data/products.js actualizado exitosamente con 27 nuevas poleras.');
} else {
  console.error('❌ No se encontró splitMarker en products.js');
}
