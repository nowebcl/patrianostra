import PocketBase from 'pocketbase';
import fs from 'node:fs';

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const pb = new PocketBase(POCKETBASE_URL);

async function syncProductsJs() {
  console.log('📡 Conectando a PocketBase...');
  await pb.collection('_superusers').authWithPassword(
    'contacto@patrianostradistro.cl',
    'PatriaNostra2026!'
  );
  const records = await pb.collection('products').getFullList({
    sort: '-created,-@rowid'
  });
  console.log(`📦 Obtenidos ${records.length} productos de PocketBase.`);

  // Leer productos actuales de products.js
  const productsJsContent = fs.readFileSync('src/data/products.js', 'utf8');

  // Mapear records de PB a formato products.js
  const mappedList = records.map(p => {
    let gallery = p.gallery;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch { gallery = []; }
    }
    if (!Array.isArray(gallery)) gallery = [];

    const col = p.collectionId || 'pbc_4092854851';
    const rawImages = (p.images || []).map(img => `${POCKETBASE_URL}/api/files/${col}/${p.id}/${img}`);
    
    const colorImages = {};
    const colors = [];
    gallery.forEach(item => {
      if (item && item.color && item.url) {
        colorImages[item.color] = item.url;
        if (!colors.includes(item.color)) colors.push(item.color);
      }
    });

    const mainImage = p.image || rawImages[0] || '/producto.webp';

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || null,
      category: p.category,
      badge: p.badge || null,
      stock: p.stock ?? 10,
      sizeStock: p.sizeStock && typeof p.sizeStock === 'object' ? p.sizeStock : { 'S': 2, 'M': 3, 'L': 3, 'XL': 2 },
      gender: p.gender || 'Unisex',
      gsm: p.gsm || '240 GSM Algodón Pesado',
      fit: p.fit || 'Corte Regular',
      description: p.description || '',
      features: Array.isArray(p.features) ? p.features : [],
      sku: p.sku || `PN-${p.id}`,
      image: mainImage,
      images: rawImages.length > 0 ? rawImages : [mainImage],
      colorImages: Object.keys(colorImages).length > 0 ? colorImages : { 'Negro': mainImage },
      colors: colors.length > 0 ? colors : ['Negro'],
      defaultColor: colors[0] || 'Negro',
      sizes: p.sizes && Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      isFeatured: p.isFeatured || false,
      isNew: p.isNew || false,
      created: p.created,
      updated: p.updated
    };
  });

  // Mantener collaborations y exports intactos
  const collabsMatch = productsJsContent.match(/export const collaborations =[\s\S]*$/);
  const collabsPart = collabsMatch ? collabsMatch[0] : '';

  const newContent = `// Catálogo Oficial Patria Nostra - Streetwear Nacionalista
// Sincronizado automáticamente con PocketBase Cloud (${new Date().toISOString()})

export const products = ${JSON.stringify(mappedList, null, 2)};

${collabsPart}
`;

  fs.writeFileSync('src/data/products.js', newContent, 'utf8');
  console.log(`✅ src/data/products.js actualizado con ${mappedList.length} productos y nuevas URLs WebP!`);
}

syncProductsJs().catch(console.error);
