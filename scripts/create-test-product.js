import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://patrianostradistropb.noweb.cl';
const SUPERUSER_EMAIL = 'contacto@patrianostradistro.cl';
const SUPERUSER_PASS = 'PatriaDistro2026!';

const pb = new PocketBase(POCKETBASE_URL);

async function main() {
  try {
    try {
      await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    } catch {
      await pb.admins.authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    }
    console.log('Logged in to PocketBase');

    const result = await pb.collection('products').getList(1, 1, {
      filter: 'sku = "PN-TEST-FLOW"'
    });

    if (result.items.length > 0) {
      console.log('Test product already exists in PocketBase:', result.items[0].id);
      return;
    }

    const testItem = {
      name: 'PRODUCTO DE PRUEBA (TEST FLOW)',
      sku: 'PN-TEST-FLOW',
      price: 350,
      originalPrice: 1000,
      badge: 'MINIMO $350 CLP',
      category: 'Accesorios',
      gender: 'Unisex',
      stock: 999,
      sizeStock: JSON.stringify({ 'Única': 999 }),
      sizes: JSON.stringify(['Única']),
      gsm: 'Digital / Test',
      fit: 'Prueba Pasarela Flow',
      description: 'Producto especial con el valor mínimo permitido por Flow ($350 CLP) para probar la integración de pagos, retorno automático y generación del PDF con la orden de compra.',
      specs: JSON.stringify([
        'Valor mínimo oficial Flow: $350 CLP',
        'Despacho y prueba digital inmediata ($0 costo de envío)',
        'Descarga automática de orden en PDF tras la compra',
        'Verificación en tiempo real de la pasarela Flow / Webpay'
      ]),
      isFeatured: true
    };

    const created = await pb.collection('products').create(testItem);
    console.log('Successfully created test product in PocketBase! ID:', created.id);
  } catch (err) {
    console.error('Error creating test product in PocketBase:', err.message);
  }
}

main();
