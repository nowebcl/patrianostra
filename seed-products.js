import PocketBase from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from './src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const SUPERUSER_EMAIL = 'contacto@patrianostradistro.cl';
const SUPERUSER_PASS = 'PatriaDistro2026!';

const pb = new PocketBase(POCKETBASE_URL);

async function runSeed() {
  console.log('🚀 Iniciando script de migración y sembrado a PocketBase...');
  console.log(`📡 Conectando a ${POCKETBASE_URL}...`);

  // 1. Autenticación de Superuser
  try {
    // PocketBase v0.23+ usa la colección '_superusers'
    await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    console.log('✅ Autenticación como Superuser exitosa.');
  } catch (err) {
    console.warn('⚠️ Falló autenticación en _superusers, intentando pb.admins:', err.message);
    try {
      await pb.admins.authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
      console.log('✅ Autenticación en pb.admins exitosa.');
    } catch (adminErr) {
      console.error('❌ Error crítico de autenticación:', adminErr);
      process.exit(1);
    }
  }

  // 2. Verificar o crear la colección 'products'
  let productsCollection = null;
  try {
    productsCollection = await pb.collections.getOne('products');
    console.log('ℹ️ La colección "products" ya existe.');
  } catch (e) {
    console.log('📦 Creando colección "products"...');
  }

  const collectionDefinition = {
    name: 'products',
    type: 'base',
    listRule: '', // Público para lectura
    viewRule: '', // Público para lectura
    createRule: null, // Solo superuser / admin
    updateRule: null, // Solo superuser / admin
    deleteRule: null, // Solo superuser / admin
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'number', required: true },
      { name: 'originalPrice', type: 'number' },
      { name: 'category', type: 'text' },
      { name: 'badge', type: 'text' },
      { name: 'stock', type: 'number' },
      { name: 'gender', type: 'text' },
      { name: 'sku', type: 'text' },
      { name: 'gsm', type: 'text' },
      { name: 'fit', type: 'text' },
      { name: 'specs', type: 'json' },
      { name: 'sizes', type: 'json' },
      { name: 'isFeatured', type: 'bool' },
      {
        name: 'images',
        type: 'file',
        maxSelect: 10,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
      }
    ]
  };

  if (!productsCollection) {
    try {
      productsCollection = await pb.collections.create(collectionDefinition);
      console.log('✅ Colección "products" creada exitosamente.');
    } catch (colErr) {
      console.error('❌ Error creando colección "products":', colErr.response?.data || colErr.message);
      process.exit(1);
    }
  } else {
    // Asegurar que las reglas públicas de lectura estén configuradas
    if (productsCollection.listRule !== '' || productsCollection.viewRule !== '') {
      try {
        await pb.collections.update('products', {
          listRule: '',
          viewRule: ''
        });
        console.log('✅ Reglas públicas de lectura actualizadas en "products".');
      } catch (err) {
        console.warn('⚠️ No se pudieron actualizar las reglas de la colección:', err.message);
      }
    }
  }

  // 3. Obtener registros existentes para no duplicar
  const existingRecords = await pb.collection('products').getFullList();
  console.log(`📊 Productos actualmente en la base de datos: ${existingRecords.length}`);

  // 4. Sembrar productos locales
  for (const prod of products) {
    const existing = existingRecords.find(r => r.name.toLowerCase() === prod.name.toLowerCase() || r.sku === prod.sku);

    if (existing) {
      console.log(`⏩ Producto ya existe: "${prod.name}" (ID: ${existing.id}). Saltando...`);
      continue;
    }

    console.log(`📤 Subiendo producto: "${prod.name}"...`);

    const formData = new FormData();
    formData.append('name', prod.name);
    formData.append('description', prod.description || '');
    formData.append('price', String(prod.price || 0));
    if (prod.originalPrice) formData.append('originalPrice', String(prod.originalPrice));
    formData.append('category', (prod.category || '').toLowerCase());
    if (prod.badge) formData.append('badge', prod.badge);
    formData.append('stock', String(prod.stock !== undefined ? prod.stock : 10));
    if (prod.gender) formData.append('gender', prod.gender);
    if (prod.sku) formData.append('sku', prod.sku);
    if (prod.gsm) formData.append('gsm', prod.gsm);
    if (prod.fit) formData.append('fit', prod.fit);
    formData.append('isFeatured', String(!!prod.isFeatured));
    formData.append('specs', JSON.stringify(prod.specs || []));
    formData.append('sizes', JSON.stringify(prod.sizes || ['S', 'M', 'L', 'XL']));

    // Adjuntar imágenes desde el directorio public
    const imageList = prod.gallery && prod.gallery.length > 0 ? prod.gallery : [prod.image];
    const attachedFiles = new Set();

    for (const imgPath of imageList) {
      if (!imgPath) continue;
      const cleanRel = imgPath.replace(/^\//, '');
      const localFilePath = path.join(__dirname, 'public', cleanRel);

      if (fs.existsSync(localFilePath) && !attachedFiles.has(cleanRel)) {
        attachedFiles.add(cleanRel);
        const fileData = fs.readFileSync(localFilePath);
        const ext = path.extname(localFilePath).toLowerCase();
        let mime = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.webp') mime = 'image/webp';

        const blob = new Blob([fileData], { type: mime });
        formData.append('images', blob, path.basename(localFilePath));
        console.log(`   📷 Adjuntada imagen: ${path.basename(localFilePath)} (${(fileData.length / 1024).toFixed(1)} KB)`);
      }
    }

    try {
      const createdRecord = await pb.collection('products').create(formData);
      console.log(`✅ Creado registro PocketBase: ${createdRecord.name} (ID: ${createdRecord.id}) con ${createdRecord.images?.length || 0} imágenes.`);
    } catch (createErr) {
      console.error(`❌ Error creando producto "${prod.name}":`, createErr.response?.data || createErr.message);
    }
  }

  console.log('\n🎉 ¡Sembrado de catálogo completado con éxito en PocketBase!');
}

runSeed().catch(err => {
  console.error('💥 Error inesperado durante el sembrado:', err);
  process.exit(1);
});
