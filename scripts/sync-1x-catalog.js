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

export const newProductsList = [
  {
    file: '7 muelles .png',
    name: 'POLERA 7 MUELLES',
    slug: 'polera-7-muelles',
    sku: 'PN-POL-007',
    stock: 22,
    desc: 'Polera underground de alto gramaje con gráfica serigrafiada "7 Muelles". Confección de precisión en 100% algodón peinado de 240 GSM y tintas textiles de máxima resistencia al lavado.'
  },
  {
    file: 'ANTISOCIAL .png',
    name: 'POLERA ANTISOCIAL',
    slug: 'polera-antisocial',
    sku: 'PN-POL-008',
    stock: 25,
    desc: 'Polera de estética rebelde con estampado frontal "ANTISOCIAL" en serigrafía mate al agua. Estructura tubular en algodón peinado de 240 GSM con costuras dobles reforzadas.'
  },
  {
    file: 'Antisocial blanco .png',
    name: 'POLERA ANTISOCIAL BLANCO',
    slug: 'polera-antisocial-blanco',
    sku: 'PN-POL-009',
    stock: 18,
    desc: 'Edición en blanco puro con gráfica de alto contraste "ANTISOCIAL". Tejido premium de 240 GSM pre-encogido con tacto suave y ajuste regular estructurado.'
  },
  {
    file: 'battlezone.png',
    name: 'POLERA BATTLEZONE',
    slug: 'polera-battlezone',
    sku: 'PN-POL-010',
    stock: 20,
    desc: 'Polera de tributo musical y temática combativa "Battlezone". Impresión serigráfica artesanal curada al horno sobre algodón pesado de 240 GSM.'
  },
  {
    file: 'BDCCKBK.png',
    name: 'POLERA BDCCKBK',
    slug: 'polera-bdcckbk',
    sku: 'PN-POL-011',
    stock: 16,
    desc: 'Polera de diseño emblemático "BDCCKBK" con tipografía de alto impacto. Algodón peinado de 240 GSM con costuras dobles de refuerzo de hombro a hombro.'
  },
  {
    file: 'BFGout .png',
    name: 'POLERA BFG OUT',
    slug: 'polera-bfg-out',
    sku: 'PN-POL-012',
    stock: 24,
    desc: 'Prenda clásica de corte estructurado y gráfico "BFG Out" de alta definición. Algodón pesado de máxima durabilidad para el uso diario urbano.'
  },
  {
    file: 'Bound for  glory .png',
    name: 'POLERA BOUND FOR GLORY',
    slug: 'polera-bound-for-glory',
    sku: 'PN-POL-013',
    stock: 20,
    desc: 'Polera con diseño clásico "Bound For Glory". Estampado de alta definición resistente al desgaste y tejido 100% algodón peinado de 240 GSM.'
  },
  {
    file: 'brassic.png',
    name: 'POLERA BRASSIC',
    slug: 'polera-brassic',
    sku: 'PN-POL-014',
    stock: 19,
    desc: 'Edición especial "Brassic" con ilustración en serigrafía mate. Confeccionada con cuello acanalado reforzado de 3 cm y algodón 240 GSM.'
  },
  {
    file: 'Brutal attack 1980.png',
    name: 'POLERA BRUTAL ATTACK 1980',
    slug: 'polera-brutal-attack-1980',
    sku: 'PN-POL-015',
    stock: 26,
    desc: 'Diseño conmemorativo "Brutal Attack 1980" en serigrafía de alta densidad. Prenda de corte regular y tejido antidesgaste de 240 GSM.'
  },
  {
    file: 'Bunker 84.png',
    name: 'POLERA BUNKER 84',
    slug: 'polera-bunker-84',
    sku: 'PN-POL-016',
    stock: 15,
    desc: 'Polera legendaria "Bunker 84" con gráfica curada en serigrafía tradicional. Confección en algodón 240 GSM con resistencia superior al lavado.'
  },
  {
    file: 'defender skinhead .png',
    name: 'POLERA DEFENDER SKINHEAD',
    slug: 'polera-defender-skinhead',
    sku: 'PN-POL-017',
    stock: 21,
    desc: 'Polera representativa de la cultura tradicional skinhead con gráfica de alta definición. Algodón peinado 240 GSM y costuras reforzadas.'
  },
  {
    file: 'Division 250 .png',
    name: 'POLERA DIVISION 250',
    slug: 'polera-division-250',
    sku: 'PN-POL-018',
    stock: 28,
    desc: 'Diseño histórico "División 250" con estampado frontal serigráfico de máxima fidelidad. Confeccionada en algodón pesado de 240 GSM.'
  },
  {
    file: 'DRAMATIC BATTLE .png',
    name: 'POLERA DRAMATIC BATTLE',
    slug: 'polera-dramatic-battle',
    sku: 'PN-POL-019',
    stock: 17,
    desc: 'Polera de corte urbano estructurado con gráfica "Dramatic Battle". Estampa reactiva al agua que garantiza tacto suave y durabilidad extrema.'
  },
  {
    file: 'ENGLISH ROSE SKINHEAD .png',
    name: 'POLERA ENGLISH ROSE SKINHEAD',
    slug: 'polera-english-rose-skinhead',
    sku: 'PN-POL-020',
    stock: 22,
    desc: 'Diseño clásico "English Rose Skinhead" con estampado serigráfico frontal. Algodón peinado de 240 GSM pre-encogido y cuello reforzado.'
  },
  {
    file: 'ENGLISH ROSES ROSAS .png',
    name: 'POLERA ENGLISH ROSES ROSAS',
    slug: 'polera-english-roses-rosas',
    sku: 'PN-POL-021',
    stock: 19,
    desc: 'Variante "English Roses" con detalles cromáticos en rosas de alto contraste. Serigrafía multicapa curada al horno sobre algodón negro 240 GSM.'
  },
  {
    file: 'Estirpe Aguila .png',
    name: 'POLERA ESTIRPE AGUILA',
    slug: 'polera-estirpe-aguila',
    sku: 'PN-POL-022',
    stock: 25,
    desc: 'Diseño patriótico "Estirpe Águila" con heráldica de gran tamaño en serigrafía de precisión. Confección en algodón pesado de 240 GSM.'
  },
  {
    file: 'Estirpebotas.png',
    name: 'POLERA ESTIRPE BOTAS',
    slug: 'polera-estirpe-botas',
    sku: 'PN-POL-023',
    stock: 20,
    desc: 'Gráfica icónica "Estirpe Botas" con simbología tradicional de botas de combate. Algodón peinado de 240 GSM con cuello acanalado reforzado.'
  },
  {
    file: 'Kategorie C.png',
    name: 'POLERA KATEGORIE C',
    slug: 'polera-kategorie-c',
    sku: 'PN-POL-024',
    stock: 23,
    desc: 'Polera de tributo "Kategorie C" con tipografía alemana y gráfica combativa. Serigrafía resistente de alta densidad en algodón peinado de 240 GSM.'
  },
  {
    file: 'Kill baby kill fire .png',
    name: 'POLERA KILL BABY KILL FIRE',
    slug: 'polera-kill-baby-kill-fire',
    sku: 'PN-POL-025',
    stock: 18,
    desc: 'Edición gráfica de alto impacto "Kill Baby Kill Fire". Estampado al agua serigráfico de acabado mate sobre tejido pesado de 240 GSM.'
  },
  {
    file: 'KILLBABY KILL GIVEBACK.png',
    name: 'POLERA KILLBABY KILL GIVEBACK',
    slug: 'polera-killbaby-kill-giveback',
    sku: 'PN-POL-026',
    stock: 22,
    desc: 'Polera serigrafiada "Killbaby Kill Giveback" con diseño de edición limitada. Confección artesanal con algodón 240 GSM pre-encogido.'
  },
  {
    file: 'POST MORTEM .png',
    name: 'POLERA POST MORTEM',
    slug: 'polera-post-mortem',
    sku: 'PN-POL-027',
    stock: 16,
    desc: 'Polera de estética oscura y temática underground "Post Mortem". Serigrafía de alta densidad que mantiene el color tras múltiples lavados.'
  },
  {
    file: 'TMF.png',
    name: 'POLERA TMF',
    slug: 'polera-tmf',
    sku: 'PN-POL-028',
    stock: 24,
    desc: 'Diseño insignia "TMF" con marcado estilo urbano combativo. Estructura tubular sin costuras laterales en algodón peinado de 240 GSM.'
  },
  {
    file: 'torqeumada.png',
    name: 'POLERA TORQUEMADA',
    slug: 'polera-torquemada',
    sku: 'PN-POL-029',
    stock: 20,
    desc: 'Polera histórica con ilustración temática "Torquemada". Algodón pesado de 240 GSM con tratamiento antipilling y doble costura reforzada.'
  },
  {
    file: 'Total anihilation .png',
    name: 'POLERA TOTAL ANIHILATION',
    slug: 'polera-total-anihilation',
    sku: 'PN-POL-030',
    stock: 17,
    desc: 'Diseño de máxima potencia visual "Total Anihilation". Serigrafía curada artesanalmente sobre algodón 100% peinado de alto gramaje.'
  },
  {
    file: 'Ultima Thule .png',
    name: 'POLERA ULTIMA THULE',
    slug: 'polera-ultima-thule',
    sku: 'PN-POL-031',
    stock: 27,
    desc: 'Tributo nórdico oficial "Ultima Thule" con simbología vikinga y gráfica tradicional. Algodón pesado de 240 GSM con calce regular cómodo.'
  },
  {
    file: 'ULTIMA THULE ROJO .png',
    name: 'POLERA ULTIMA THULE ROJO',
    slug: 'polera-ultima-thule-rojo',
    sku: 'PN-POL-032',
    stock: 21,
    desc: 'Edición con detalles en rojo intenso "Ultima Thule Rojo". Estampado serigráfico de máxima durabilidad y contraste sobre fondo negro profundo.'
  },
  {
    file: 'Youngland .png',
    name: 'POLERA YOUNGLAND',
    slug: 'polera-youngland',
    sku: 'PN-POL-033',
    stock: 22,
    desc: 'Polera clásica con diseño oficial "Youngland". Confeccionada con algodón de 240 GSM y cuello acanalado de 3 cm para mantener su forma original.'
  }
];

async function syncCatalog() {
  console.log('🚀 Iniciando proceso de alta de productos de public/1x...');

  // 1. Conexión y autenticación PocketBase
  const pb = new PocketBase(POCKETBASE_URL);
  try {
    await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    console.log('✅ Conectado y autenticado en PocketBase como Superuser.');
  } catch (err) {
    console.warn('⚠️ Falló _superusers, intentando pb.admins:', err.message);
    await pb.admins.authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    console.log('✅ Conectado en pb.admins.');
  }

  // 2. Obtener productos existentes en PocketBase
  const existingRecords = await pb.collection('products').getFullList();
  console.log(`📊 Productos actuales en base de datos PocketBase: ${existingRecords.length}`);

  let uploadedCount = 0;

  for (const item of newProductsList) {
    const existing = existingRecords.find(
      r => r.name?.toLowerCase() === item.name.toLowerCase() || r.sku === item.sku
    );

    if (existing) {
      console.log(`⏩ "${item.name}" ya existe en PocketBase (ID: ${existing.id}). Saltando...`);
      continue;
    }

    const localImgPath = path.join(rootDir, 'public', '1x', item.file);
    if (!fs.existsSync(localImgPath)) {
      console.warn(`⚠️ Archivo de imagen no encontrado: ${localImgPath}`);
      continue;
    }

    console.log(`📤 Subiendo "${item.name}" ($12.000) a PocketBase...`);
    const fileData = fs.readFileSync(localImgPath);
    const blob = new Blob([fileData], { type: 'image/png' });

    const formData = new FormData();
    formData.append('name', item.name);
    formData.append('description', item.desc);
    formData.append('price', '12000');
    formData.append('category', 'poleras');
    formData.append('badge', '');
    formData.append('stock', String(item.stock));
    formData.append('gender', 'Unisex');
    formData.append('sku', item.sku);
    formData.append('gsm', '240 GSM Algodón Pesado');
    formData.append('fit', 'Corte Regular');
    formData.append('isFeatured', 'false');
    formData.append('specs', JSON.stringify([
      '100% Algodón peinado de alto gramaje (240 GSM)',
      'Estampado serigráfico curado al horno de máxima resistencia',
      'Cuello acanalado de 3 cm reforzado con pespunte doble',
      'Costuras reforzadas en hombros y sisa para máxima durabilidad',
      'Prenda pre-encogida con calce estructurado'
    ]));
    formData.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']));
    formData.append('images', blob, item.file);

    try {
      const record = await pb.collection('products').create(formData);
      console.log(`✅ [${++uploadedCount}/${newProductsList.length}] Creado: ${record.name} (ID: ${record.id})`);
    } catch (createErr) {
      console.error(`❌ Error creando "${item.name}":`, createErr.response?.data || createErr.message);
    }
  }

  console.log(`\n🎉 Finalizada carga a PocketBase. Total nuevos subidos: ${uploadedCount}.`);
}

syncCatalog().catch(err => {
  console.error('💥 Error crítico:', err);
  process.exit(1);
});
