import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const productsJsPath = path.join(rootDir, 'src', 'data', 'products.js');
let content = fs.readFileSync(productsJsPath, 'utf-8');

// Replace /producto.png with /producto.webp
content = content.replaceAll('/producto.png', '/producto.webp');

// Replace /1x/... .png with /1x/...webp
content = content.replace(/\/1x\/([^'"]+?)\s*\.png/g, (match, p1) => {
  return `/1x/${p1.trim()}.webp`;
});

fs.writeFileSync(productsJsPath, content, 'utf-8');
console.log('✅ src/data/products.js actualizado para usar WebP.');
