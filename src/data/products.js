export const products = [
  {
    id: 'hoodie-patria',
    name: 'POLERÓN PATRIA NOSTRA',
    price: 59990,
    originalPrice: 69990,
    image: '/producto.png',
    gallery: ['/producto.png', '/hero2.png', '/hero3.png'],
    badge: 'EDICIÓN LIMITADA',
    category: 'Polerones',
    gender: 'Unisex',
    stock: 14,
    sku: 'PN-HD-001',
    gsm: '380 GSM Algodón Pesado',
    fit: 'Corte Oversize Boxy',
    description: 'Polerón de alto gramaje 380 GSM con corte oversize estructurado. Estampado serigráfico de alta densidad con el escudo oficial de Patria Nostra en espalda y frontal. Confeccionado en algodón peinado de alto gramaje con interior afelpado térmico.',
    specs: [
      '100% Algodón peinado de alto gramaje (380 GSM)',
      'Serigrafía mate al agua de alta resistencia al lavado',
      'Capucha doblemente forrada sin cordones para estética limpia',
      'Puños y cintura acanalados en rib 2x2 reforzado',
      'Corte boxy con hombros caídos',
      'Fabricado en tiradas limitadas de 100 unidades numeradas'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: true
  },
  {
    id: 'tshirt-patria',
    name: 'CAMISETA PATRIA NOSTRA',
    price: 24990,
    originalPrice: null,
    image: '/producto.png',
    gallery: ['/producto.png', '/hero2.png'],
    badge: null,
    category: 'Camisetas',
    gender: 'Unisex',
    stock: 28,
    sku: 'PN-TS-002',
    gsm: '240 GSM Algodón Pesado',
    fit: 'Corte Holgado',
    description: 'Camiseta de algodón peinado 240 GSM de máxima durabilidad. Tratamiento vintage lavado y serigrafía mate al agua del escudo táctico en el pecho. Diseñada para soportar el desgaste de la calle y el escenario.',
    specs: [
      '100% Algodón peinado premium (240 GSM)',
      'Tratamiento de lavado ácido sutil con tacto ultrasuave',
      'Cuello acanalado de 3 cm reforzado',
      'Costuras dobles reforzadas en hombros y dobladillo',
      'Estampa artesanal curada al horno'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true
  },
  {
    id: 'tshirt-kronstadt',
    name: 'CAMISETA KRONSTADT',
    price: 24990,
    originalPrice: 29990,
    image: '/producto.png',
    gallery: ['/producto.png', '/banner1.png'],
    badge: 'EDICIÓN LIMITADA',
    category: 'Camisetas',
    gender: 'Unisex',
    stock: 8,
    sku: 'PN-KRN-003',
    gsm: '240 GSM Algodón Pesado',
    fit: 'Corte Holgado',
    description: 'Colaboración oficial Kronstadt x Patria Nostra. Estampa calavera militar táctica con serigrafía craquelada artesanal y texto de edición de coleccionista. Merch oficial con licencia exclusiva.',
    specs: [
      'Colaboración oficial de edición numerada',
      'Algodón 240 GSM peinado y preencogido',
      'Serigrafía con efecto vintage craquelado',
      'Etiqueta tejida cosida en el bajo izquierdo'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: true
  },
  {
    id: 'hoodie-noglory',
    name: 'POLERÓN NO GLORY',
    price: 59990,
    originalPrice: 69990,
    image: '/producto.png',
    gallery: ['/producto.png', '/hero3.png'],
    badge: null,
    category: 'Polerones',
    gender: 'Unisex',
    stock: 19,
    sku: 'PN-HD-004',
    gsm: '380 GSM Algodón Pesado',
    fit: 'Corte Oversize Boxy',
    description: 'Polerón negro profundo con tipografía gótica "NO GLORY ONLY LOYALTY" en serigrafía ocre/arena militar en la espalda. Capucha doble forro sin cordones, bolsillo canguro amplio y acabados de precisión militar.',
    specs: [
      'Algodón 380 GSM con interior perchado cálido',
      'Tipografía gótica en relieve de serigrafía mate',
      'Bolsillo canguro frontal con remates invisibles',
      'Tratamiento antipilling'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    isFeatured: true
  },
  {
    id: 'cargo-tactical-pn',
    name: 'PANTALÓN TÁCTICO CARGO',
    price: 49990,
    originalPrice: null,
    image: '/producto.png',
    gallery: ['/producto.png', '/hero2.png'],
    badge: 'EDICIÓN LIMITADA',
    category: 'Pantalones',
    gender: 'Unisex',
    stock: 12,
    sku: 'PN-CG-005',
    gsm: '320 GSM Antidesgarro',
    fit: 'Corte Cargo Ajustado',
    description: 'Pantalón cargo de alta resistencia en tejido antidesgarro con 6 bolsillos utilitarios y ajustadores de tobillo. Estilo táctico underground con remaches reforzados.',
    specs: [
      'Tejido de algodón técnico 320 GSM',
      '6 Bolsillos con fuelle y solapa de cierre',
      'Ceñidores elásticos ajustables en bajos',
      'Cintura con trabillas militares extra anchas'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false
  },
  {
    id: 'cap-patria-nostra',
    name: 'GORRA TÁCTICA PATRIA NOSTRA',
    price: 19990,
    originalPrice: null,
    image: '/producto.png',
    gallery: ['/producto.png', '/hero2.png'],
    badge: null,
    category: 'Accesorios',
    gender: 'Unisex',
    stock: 35,
    sku: 'PN-CP-006',
    gsm: 'Sarga de algodón reforzada',
    fit: 'Ajustable',
    description: 'Gorra desestructurada en sarga negra con bordado tonal de alta densidad del escudo en la parte frontal y cierre metálico grabado.',
    specs: [
      'Sarga 100% Algodón lavado',
      'Bordado 3D de precisión milimétrica',
      'Cierre metálico ajustable con hebilla mate',
      'Visera curvada con costuras reforzadas'
    ],
    sizes: ['Única'],
    isFeatured: false
  }
];

export const collaborations = [
  {
    id: 'kronstadt',
    title: 'KRONSTADT',
    subtitle: 'SIN CONCESIONES',
    image: '/assets/images/collab_kronstadt_img.png',
    badge: null,
    actionText: 'DISPONIBLE AHORA →'
  },
  {
    id: 'bastion',
    title: 'BASTIÓN',
    subtitle: 'HXC',
    image: '/assets/images/collab_bastion_img.png',
    badge: 'PRÓXIMAMENTE',
    actionText: null
  },
  {
    id: 'disidencia',
    title: 'DISIDENCIA',
    subtitle: 'PUNK ROCK',
    image: '/assets/images/collab_disidencia_img.png',
    badge: 'PRÓXIMAMENTE',
    actionText: null
  }
];
