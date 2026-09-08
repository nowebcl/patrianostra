import PocketBase from 'pocketbase';

const OLD_PB_URL = 'https://pn.noweb.tech';
const OLD_SUPERUSER_EMAIL = 'contacto@patrianostradistro.cl';
const OLD_SUPERUSER_PASS = 'PatriaNostra2026!';

const NEW_PB_URL = 'https://patrianostradistropb.noweb.cl';
const NEW_SUPERUSER_EMAIL = 'contacto@patrianostradistro.cl';
const NEW_SUPERUSER_PASS = 'PatriaDistro2026!';

async function authenticate(pb, url, email, password) {
  try {
    await pb.collection('_superusers').authWithPassword(email, password);
    console.log(`✅ Autenticado como superusuario en ${url}`);
  } catch (err) {
    console.warn(`⚠️ Intento en _superusers falló en ${url}, probando pb.admins:`, err.message);
    await pb.admins.authWithPassword(email, password);
    console.log(`✅ Autenticado como admin en ${url}`);
  }
}

async function ensureProductsCollection(pbNew) {
  let existing = null;
  try {
    existing = await pbNew.collections.getOne('products');
    console.log('ℹ️ Colección "products" ya existe en la nueva base de datos.');
  } catch {
    console.log('📦 Creando colección "products" en la nueva base de datos...');
  }

  const productsDefinition = {
    name: 'products',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
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
      },
      { name: 'sizeStock', type: 'json' }
    ]
  };

  if (!existing) {
    existing = await pbNew.collections.create(productsDefinition);
    console.log('✅ Colección "products" creada exitosamente.');
  } else {
    await pbNew.collections.update('products', {
      listRule: '',
      viewRule: ''
    });
    console.log('✅ Reglas públicas verificadas en colección "products".');
  }
  return existing;
}

async function ensureOrdersCollection(pbNew) {
  let existing = null;
  try {
    existing = await pbNew.collections.getOne('orders');
    console.log('ℹ️ Colección "orders" ya existe en la nueva base de datos.');
  } catch {
    console.log('📦 Creando colección "orders" en la nueva base de datos...');
  }

  const ordersDefinition = {
    name: 'orders',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: '',
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: 'orderNumber', type: 'text', required: true },
      { name: 'status', type: 'text' },
      { name: 'date', type: 'text' },
      { name: 'customer', type: 'json' },
      { name: 'items', type: 'json' },
      { name: 'subtotal', type: 'number' },
      { name: 'discountAmount', type: 'number' },
      { name: 'shippingCost', type: 'number' },
      { name: 'finalTotal', type: 'number' },
      { name: 'trackingNumber', type: 'text' },
      { name: 'paymentStatus', type: 'text' },
      { name: 'paymentDetails', type: 'json' }
    ]
  };

  if (!existing) {
    existing = await pbNew.collections.create(ordersDefinition);
    console.log('✅ Colección "orders" creada exitosamente.');
  } else {
    await pbNew.collections.update('orders', {
      createRule: ''
    });
    console.log('✅ Regla de creación pública verificada en colección "orders".');
  }
  return existing;
}

async function migrateProducts(pbOld, pbNew) {
  console.log('\n--- 📥 Migrando Productos e Imágenes ---');
  const oldProducts = await pbOld.collection('products').getFullList();
  console.log(`Se encontraron ${oldProducts.length} productos en la base de datos antigua.`);

  const newProducts = await pbNew.collection('products').getFullList();
  const existingMap = new Map();
  newProducts.forEach(p => {
    existingMap.set(p.id, p);
    if (p.sku) existingMap.set(p.sku, p);
    if (p.name) existingMap.set(p.name.toLowerCase().trim(), p);
  });

  let migratedCount = 0;
  let skippedCount = 0;

  for (const prod of oldProducts) {
    if (existingMap.has(prod.id) || existingMap.has(prod.sku) || existingMap.has(prod.name.toLowerCase().trim())) {
      console.log(`⏩ [${prod.name}] ya existe en la nueva base de datos. Saltando...`);
      skippedCount++;
      continue;
    }

    console.log(`🔄 Migrando [${prod.name}] (ID: ${prod.id})...`);
    const formData = new FormData();
    formData.append('id', prod.id);
    formData.append('name', prod.name || '');
    formData.append('description', prod.description || '');
    formData.append('price', String(prod.price ?? 0));
    if (prod.originalPrice !== undefined && prod.originalPrice !== null) {
      formData.append('originalPrice', String(prod.originalPrice));
    }
    formData.append('category', prod.category || 'poleras');
    if (prod.badge) formData.append('badge', prod.badge);
    formData.append('stock', String(prod.stock ?? 10));
    if (prod.gender) formData.append('gender', prod.gender);
    if (prod.sku) formData.append('sku', prod.sku);
    if (prod.gsm) formData.append('gsm', prod.gsm);
    if (prod.fit) formData.append('fit', prod.fit);
    formData.append('isFeatured', String(!!prod.isFeatured));
    formData.append('specs', JSON.stringify(prod.specs || []));
    formData.append('sizes', JSON.stringify(prod.sizes || ['S', 'M', 'L', 'XL']));
    formData.append('sizeStock', JSON.stringify(prod.sizeStock || {}));

    // Descargar imágenes de pbOld
    const imageList = Array.isArray(prod.images) ? prod.images : [];
    for (const imgName of imageList) {
      const imgUrl = `${OLD_PB_URL}/api/files/${prod.collectionId || 'products'}/${prod.id}/${imgName}`;
      try {
        const resp = await fetch(imgUrl);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const contentType = resp.headers.get('content-type') || 'image/webp';
          const blob = new Blob([arrayBuffer], { type: contentType });
          formData.append('images', blob, imgName);
          console.log(`   🖼️ Imagen descargada y adjuntada: ${imgName} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
        } else {
          console.warn(`   ⚠️ Error descargando imagen ${imgUrl}: ${resp.status}`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Excepción descargando imagen ${imgName}:`, err.message);
      }
    }

    try {
      const created = await pbNew.collection('products').create(formData);
      console.log(`✅ [${created.name}] creado en nueva DB con ID: ${created.id} (${created.images?.length || 0} imágenes)`);
      migratedCount++;
    } catch (createErr) {
      console.error(`❌ Error creando ${prod.name}:`, createErr.response?.data || createErr.message);
    }
  }

  console.log(`\n🎉 Migración de productos finalizada: ${migratedCount} migrados, ${skippedCount} existentes.`);
}

async function migrateOrders(pbOld, pbNew) {
  console.log('\n--- 📥 Verificando pedidos en la base de datos antigua ---');
  let oldOrders = [];
  try {
    oldOrders = await pbOld.collection('orders').getFullList();
  } catch (e) {
    console.log('No se pudieron leer pedidos de la base antigua:', e.message);
    return;
  }

  console.log(`Pedidos encontrados en la base antigua: ${oldOrders.length}`);
  if (oldOrders.length === 0) return;

  for (const order of oldOrders) {
    try {
      await pbNew.collection('orders').create({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        date: order.date,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingCost: order.shippingCost,
        finalTotal: order.finalTotal,
        trackingNumber: order.trackingNumber || '',
        paymentStatus: order.paymentStatus || '',
        paymentDetails: order.paymentDetails || {}
      });
      console.log(`✅ Pedido ${order.orderNumber} migrado.`);
    } catch (err) {
      console.warn(`⚠️ Error migrando pedido ${order.orderNumber}:`, err.response?.data || err.message);
    }
  }
}

async function migrateUser(pbOld, pbNew) {
  console.log('\n--- 📥 Sincronizando usuario administrador en colección "users" ---');
  try {
    const existingUsers = await pbNew.collection('users').getFullList({ filter: `email = "${NEW_SUPERUSER_EMAIL}"` });
    if (existingUsers.length > 0) {
      console.log('ℹ️ Usuario ya registrado en colección "users".');
      return;
    }

    await pbNew.collection('users').create({
      email: NEW_SUPERUSER_EMAIL,
      emailVisibility: false,
      password: NEW_SUPERUSER_PASS,
      passwordConfirm: NEW_SUPERUSER_PASS,
      name: 'Administrador Patria Nostra'
    });
    console.log('✅ Usuario administrador creado en colección "users".');
  } catch (err) {
    console.log('ℹ️ Colección "users" info:', err.response?.data || err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando proceso completo de migración...');
  const pbOld = new PocketBase(OLD_PB_URL);
  const pbNew = new PocketBase(NEW_PB_URL);

  await authenticate(pbOld, OLD_PB_URL, OLD_SUPERUSER_EMAIL, OLD_SUPERUSER_PASS);
  await authenticate(pbNew, NEW_PB_URL, NEW_SUPERUSER_EMAIL, NEW_SUPERUSER_PASS);

  await ensureProductsCollection(pbNew);
  await ensureOrdersCollection(pbNew);
  await migrateUser(pbOld, pbNew);
  await migrateProducts(pbOld, pbNew);
  await migrateOrders(pbOld, pbNew);

  console.log('\n🌟 ¡MIGRACIÓN COMPLETADA CON ÉXITO! 🌟');
}

main().catch(err => {
  console.error('💥 Error fatal durante la migración:', err);
  process.exit(1);
});
