// Patria Nostra - Interactive E-Commerce & UI System

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const products = [
    {
      id: 'hoodie-patria',
      name: 'HOODIE PATRIA NOSTRA',
      price: 89.00,
      image: 'assets/images/item_hoodie_patria.png',
      badge: 'LIMITED',
      description: 'Hoodie heavyweight 380 GSM con corte oversize estructurado. Estampado serigráfico de alta densidad con el escudo oficial de Patria Nostra en espalda y frontal.',
      category: 'Hoodies',
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'tshirt-patria',
      name: 'CAMISETA PATRIA NOSTRA',
      price: 39.00,
      image: 'assets/images/item_tshirt_patria.png',
      badge: null,
      description: 'Camiseta de algodón peinado 240 GSM de máxima durabilidad. Tratamiento vintage washed y serigrafía mate al agua del escudo táctico en el pecho.',
      category: 'Camisetas',
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'tshirt-kronstadt',
      name: 'CAMISETA KRONSTADT',
      price: 39.00,
      image: 'assets/images/item_tshirt_kronstadt.png',
      badge: 'LIMITED',
      description: 'Colaboración oficial Kronstadt x Patria Nostra. Estampa calavera militar táctica con serigrafía craquelada artesanal.',
      category: 'Camisetas',
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'hoodie-noglory',
      name: 'HOODIE NO GLORY',
      price: 89.00,
      image: 'assets/images/item_hoodie_noglory.png',
      badge: null,
      description: 'Hoodie negro profundo con tipografía gótica "NO GLORY ONLY LOYALTY" en serigrafía ocre/arena militar en la espalda. Capucha doble forro sin cordones.',
      category: 'Hoodies',
      sizes: ['M', 'L', 'XL', 'XXL']
    }
  ];

  let cart = [
    {
      product: products[0],
      size: 'L',
      quantity: 1
    }
  ];

  // --- DOM ELEMENTS ---
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const mobileCartToggleBtn = document.getElementById('mobile-cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartFilledState = document.getElementById('cart-filled-state');

  // Modals
  const quickViewModal = document.getElementById('quickview-modal');
  const quickViewBackdrop = document.getElementById('quickview-backdrop');
  const closeQuickViewBtn = document.getElementById('close-quickview-btn');
  
  const manifestoModal = document.getElementById('manifesto-modal');
  const manifestoBackdrop = document.getElementById('manifesto-backdrop');
  const openManifestoBtns = document.querySelectorAll('.open-manifesto-btn');
  const closeManifestoBtn = document.getElementById('close-manifesto-btn');

  // Mobile menu
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');

  // Toast
  const toastEl = document.getElementById('toast-notification');
  const toastMessageEl = document.getElementById('toast-message');

  // --- CART FUNCTIONS ---
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
      if (totalItems > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.remove('hidden'); // Keep showing '0' to match original mockup
      }
    });

    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = `€${totalPrice.toFixed(2)}`;
    }

    if (cart.length === 0) {
      if (cartEmptyState) cartEmptyState.classList.remove('hidden');
      if (cartFilledState) cartFilledState.classList.add('hidden');
    } else {
      if (cartEmptyState) cartEmptyState.classList.add('hidden');
      if (cartFilledState) cartFilledState.classList.remove('hidden');

      if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
          <div class="flex items-center gap-4 py-3 border-b border-neutral-800">
            <div class="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1 shrink-0">
              <img src="${item.product.image}" alt="${item.product.name}" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-condensed text-sm font-semibold tracking-wider text-neutral-200 truncate uppercase">${item.product.name}</h4>
              <p class="text-xs text-neutral-400 mt-0.5">Talla: <span class="text-neutral-200 font-semibold">${item.size}</span></p>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center border border-neutral-700">
                  <button class="cart-qty-btn px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800" data-index="${index}" data-delta="-1">-</button>
                  <span class="px-2 text-xs text-neutral-200 font-mono">${item.quantity}</span>
                  <button class="cart-qty-btn px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800" data-index="${index}" data-delta="1">+</button>
                </div>
                <span class="text-sm font-semibold text-neutral-200">€${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
            <button class="cart-remove-btn text-neutral-500 hover:text-red-500 p-1 transition-colors" data-index="${index}" title="Eliminar">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        `).join('');

        // Attach event listeners to quantity and remove buttons
        document.querySelectorAll('.cart-qty-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            const delta = parseInt(btn.getAttribute('data-delta'));
            changeCartQty(idx, delta);
          });
        });

        document.querySelectorAll('.cart-remove-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            removeFromCart(idx);
          });
        });
      }
    }
  }

  function changeCartQty(index, delta) {
    if (cart[index]) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      updateCartUI();
    }
  }

  function removeFromCart(index) {
    if (cart[index]) {
      const name = cart[index].product.name;
      cart.splice(index, 1);
      updateCartUI();
      showToast(`Se eliminó "${name}" del carrito`);
    }
  }

  function addToCart(productId, size = 'L', quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.product.id === productId && item.size === size);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, size, quantity });
    }

    updateCartUI();
    openCart();
    showToast(`Añadido: ${product.name} (${size})`);
  }

  function openCart() {
    if (cartDrawer && cartBackdrop) {
      cartBackdrop.classList.add('active');
      cartDrawer.classList.add('active');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeCart() {
    if (cartDrawer && cartBackdrop) {
      cartBackdrop.classList.remove('active');
      cartDrawer.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // --- QUICK VIEW MODAL ---
  let currentQuickViewProduct = null;
  let selectedSize = 'L';

  function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentQuickViewProduct = product;
    selectedSize = product.sizes[0];

    document.getElementById('qv-title').textContent = product.name;
    document.getElementById('qv-price').textContent = `€${product.price.toFixed(2)}`;
    document.getElementById('qv-description').textContent = product.description;
    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-image').alt = product.name;
    
    const badgeEl = document.getElementById('qv-badge');
    if (product.badge) {
      badgeEl.textContent = product.badge;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }

    const sizesContainer = document.getElementById('qv-sizes');
    sizesContainer.innerHTML = product.sizes.map(sz => `
      <button class="qv-size-btn px-3.5 py-1.5 border text-xs font-condensed font-semibold tracking-wider transition-all ${
        sz === selectedSize ? 'border-red-600 bg-red-600/20 text-white' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
      }" data-size="${sz}">
        ${sz}
      </button>
    `).join('');

    document.querySelectorAll('.qv-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSize = btn.getAttribute('data-size');
        document.querySelectorAll('.qv-size-btn').forEach(b => {
          b.className = `qv-size-btn px-3.5 py-1.5 border text-xs font-condensed font-semibold tracking-wider transition-all ${
            b.getAttribute('data-size') === selectedSize ? 'border-red-600 bg-red-600/20 text-white' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
          }`;
        });
      });
    });

    if (quickViewModal && quickViewBackdrop) {
      quickViewBackdrop.classList.add('active');
      quickViewModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeQuickView() {
    if (quickViewModal && quickViewBackdrop) {
      quickViewBackdrop.classList.remove('active');
      quickViewModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // --- MANIFESTO MODAL ---
  function openManifesto() {
    if (manifestoModal && manifestoBackdrop) {
      manifestoBackdrop.classList.add('active');
      manifestoModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeManifesto() {
    if (manifestoModal && manifestoBackdrop) {
      manifestoBackdrop.classList.remove('active');
      manifestoModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // --- MOBILE MENU ---
  function openMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuBackdrop.classList.add('active');
      mobileMenuDrawer.classList.add('active');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuBackdrop.classList.remove('active');
      mobileMenuDrawer.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // --- TOAST NOTIFICATION ---
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    toastEl.classList.add('opacity-100', 'translate-y-0');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('opacity-100', 'translate-y-0');
      toastEl.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3000);
  }

  // --- EVENT LISTENERS ---

  // Cart toggles
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (mobileCartToggleBtn) mobileCartToggleBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', (e) => {
    if (e.target === cartBackdrop) closeCart();
  });

  // Quick view triggers on product cards
  document.querySelectorAll('.btn-quickview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-product-id');
      openQuickView(pid);
    });
  });

  // Add to cart buttons on product cards
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-product-id');
      addToCart(pid, 'L', 1);
    });
  });

  // Quick view modal close & add
  if (closeQuickViewBtn) closeQuickViewBtn.addEventListener('click', closeQuickView);
  if (quickViewBackdrop) quickViewBackdrop.addEventListener('click', (e) => {
    if (e.target === quickViewBackdrop) closeQuickView();
  });

  const qvAddToCartBtn = document.getElementById('qv-add-to-cart');
  if (qvAddToCartBtn) {
    qvAddToCartBtn.addEventListener('click', () => {
      if (currentQuickViewProduct) {
        addToCart(currentQuickViewProduct.id, selectedSize, 1);
        closeQuickView();
      }
    });
  }

  // Manifesto modal triggers
  openManifestoBtns.forEach(btn => btn.addEventListener('click', openManifesto));
  if (closeManifestoBtn) closeManifestoBtn.addEventListener('click', closeManifesto);
  if (manifestoBackdrop) manifestoBackdrop.addEventListener('click', (e) => {
    if (e.target === manifestoBackdrop) closeManifesto();
  });

  // Mobile menu triggers
  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', (e) => {
    if (e.target === mobileMenuBackdrop) closeMobileMenu();
  });

  // Checkout button demo action
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      showToast('Iniciando pasarela de pago seguro SSL...');
    });
  }

  // Lookbook image click for high-res viewing
  document.querySelectorAll('.lookbook-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        showToast(`Lookbook: ${img.alt || 'Patria Nostra Editorial'}`);
      }
    });
  });

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
        }
      }
    });
  });

  // Initialize UI
  updateCartUI();
});
