/**
 * Dream Moon by Heena - Client Storefront Application
 * Features: Dark/Light Theme, Animated Hero, Category Filters, Mobile Drawer & WhatsApp Orders
 */

// Application State
let products = [];
let activeCategory = 'all';
let inquiryBag = [];
let selectedProductForInquiry = null;
let selectedColorway = '';

// Hero Preview Data
const HERO_PREVIEWS = [
  {
    title: "Sunflower Yarn Dangles",
    sub: "Exhibition Bestseller • ₹349",
    img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
    colorName: "Mustard Yellow"
  },
  {
    title: "Terracotta Daisy Choker",
    sub: "Woven Cotton Collar • ₹499",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    colorName: "Warm Terracotta"
  },
  {
    title: "Floral Sage Claw Clip",
    sub: "3D Crochet Blossom • ₹279",
    img: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=900&q=85",
    colorName: "Olive Sage"
  },
  {
    title: "Pastel Satin-Yarn Scrunchie",
    sub: "Scalloped Hand-Knit • ₹229",
    img: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=85",
    colorName: "Blush Rose"
  },
  {
    title: "Custom Charm Bracelet",
    sub: "Beaded Thread Wrap • ₹299",
    img: "https://images.unsplash.com/photo-1611591475155-42ac62973e0c?auto=format&fit=crop&w=900&q=85",
    colorName: "Ivory Cream"
  }
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const categoryFilters = document.getElementById('categoryFilters');
const inquiryModal = document.getElementById('inquiryModal');
const toastNotice = document.getElementById('toastNotice');
const mobileNavDrawer = document.getElementById('mobileNavDrawer');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleIcon = document.getElementById('themeToggleIcon');

// Initialize Store
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadProducts();
  setupCategoryFilters();
  renderProducts();
  setupInquiryModal();
  setupMobileDrawer();
  setupSmoothScrolling();
  initCoverflowDeck();
  updateStudioSummary();
});

/* ==========================================================================
   1. Theme Management (Dark & Light)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('dreammoon_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

window.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} theme`);
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('dreammoon_theme', theme);

  if (themeToggleIcon) {
    themeToggleIcon.innerText = theme === 'dark' ? '☀️' : '🌙';
  }

  const drawerThemeLabel = document.getElementById('drawerThemeLabel');
  if (drawerThemeLabel) {
    drawerThemeLabel.innerText = theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode';
  }
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function setupMobileDrawer() {
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });
  }

  const closeBtn = document.getElementById('closeMobileDrawerBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileDrawer);
  }

  if (mobileNavDrawer) {
    mobileNavDrawer.addEventListener('click', (e) => {
      if (e.target === mobileNavDrawer) closeMobileDrawer();
    });
  }
}

window.closeMobileDrawer = function() {
  if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
  if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
};

/* ==========================================================================
   3. Hero 3D Interactive Coverflow Carousel Deck
   ========================================================================== */
let currentCoverflowIndex = 0;
let coverflowTimer = null;

function initCoverflowDeck() {
  updateCoverflowCards();
  startCoverflowAutoplay();

  const deck = document.getElementById('coverflowDeck');
  if (deck) {
    deck.addEventListener('mouseenter', stopCoverflowAutoplay);
    deck.addEventListener('mouseleave', startCoverflowAutoplay);
    deck.addEventListener('touchstart', stopCoverflowAutoplay, { passive: true });
    deck.addEventListener('touchend', startCoverflowAutoplay, { passive: true });
  }
}

function updateCoverflowCards() {
  const cards = document.querySelectorAll('.coverflow-card');
  const dots = document.querySelectorAll('.coverflow-dot');
  const paletteDots = document.querySelectorAll('.hero-palette-dot');
  const total = cards.length;
  if (total === 0) return;

  cards.forEach((card, i) => {
    card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden');
    let diff = (i - currentCoverflowIndex) % total;
    if (diff < -Math.floor(total / 2)) diff += total;
    if (diff > Math.floor((total - 1) / 2)) diff -= total;

    if (diff === 0) {
      card.classList.add('pos-center');
    } else if (diff === 1 || (total === 2 && diff === -1)) {
      card.classList.add('pos-right');
    } else if (diff === -1) {
      card.classList.add('pos-left');
    } else {
      card.classList.add('pos-hidden');
    }
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentCoverflowIndex);
  });

  paletteDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentCoverflowIndex);
  });
}

window.prevCoverflow = function() {
  const cards = document.querySelectorAll('.coverflow-card');
  if (cards.length === 0) return;
  currentCoverflowIndex = (currentCoverflowIndex - 1 + cards.length) % cards.length;
  updateCoverflowCards();
};

window.nextCoverflow = function() {
  const cards = document.querySelectorAll('.coverflow-card');
  if (cards.length === 0) return;
  currentCoverflowIndex = (currentCoverflowIndex + 1) % cards.length;
  updateCoverflowCards();
};

window.jumpCoverflow = function(idx, el) {
  const cards = document.querySelectorAll('.coverflow-card');
  if (cards.length === 0) return;
  currentCoverflowIndex = idx % cards.length;
  updateCoverflowCards();
};

window.handleCardClick = function(idx) {
  const cards = document.querySelectorAll('.coverflow-card');
  if (cards.length === 0) return;
  if (currentCoverflowIndex !== idx) {
    currentCoverflowIndex = idx;
    updateCoverflowCards();
  }
};

function startCoverflowAutoplay() {
  stopCoverflowAutoplay();
  coverflowTimer = setInterval(() => {
    window.nextCoverflow();
  }, 5000);
}

function stopCoverflowAutoplay() {
  if (coverflowTimer) {
    clearInterval(coverflowTimer);
    coverflowTimer = null;
  }
}

/* ==========================================================================
   4. Products & Catalog Logic
   ========================================================================== */
async function loadProducts() {
  const localData = localStorage.getItem('dreammoon_products');
  if (localData) {
    try {
      products = JSON.parse(localData);
      return;
    } catch (e) {
      console.warn("Couldn't parse local products cache:", e);
    }
  }

  try {
    const res = await fetch('data/products.json');
    if (res.ok) {
      products = await res.json();
      return;
    }
  } catch (err) {
    console.log("Local fetch unavailable, falling back to embedded data");
  }

  if (typeof DEFAULT_PRODUCTS !== 'undefined' && Array.isArray(DEFAULT_PRODUCTS)) {
    products = DEFAULT_PRODUCTS;
  }
}

window.switchCatalogLayout = function(type) {
  const bentoGrid = document.getElementById('bentoCatalogGrid');
  const classicGrid = document.getElementById('productsGrid');
  const btnBento = document.getElementById('btnBentoView');
  const btnGrid = document.getElementById('btnGridView');

  if (type === 'bento') {
    if (bentoGrid) bentoGrid.style.display = 'grid';
    if (classicGrid) classicGrid.style.display = 'none';
    if (btnBento) btnBento.classList.add('active');
    if (btnGrid) btnGrid.classList.remove('active');
  } else {
    if (bentoGrid) bentoGrid.style.display = 'none';
    if (classicGrid) classicGrid.style.display = 'grid';
    if (btnBento) btnBento.classList.remove('active');
    if (btnGrid) btnGrid.classList.add('active');
  }
};

function setupCategoryFilters() {
  if (!categoryFilters) return;

  const buttons = categoryFilters.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderProducts();

      // Filter Bento cards
      const bentoCards = document.querySelectorAll('#bentoCatalogGrid .bento-card');
      bentoCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (activeCategory === 'all' || cat === activeCategory) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function renderProducts() {
  if (!productsGrid) return;

  const filtered = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-size: 1.2rem; font-family: var(--font-serif); margin-bottom: 8px;">No yarn pieces found in this category yet.</p>
        <p style="font-size: 0.9rem;">Check back soon or request a custom bespoke commission via WhatsApp!</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filtered.map(item => {
    const swatchesHtml = item.yarnColors && item.yarnColors.length > 0
      ? `<div class="card-swatches">
           <span style="font-size:0.7rem; font-weight:600;">Colors:</span>
           ${item.yarnColors.slice(0, 3).map(c => `<span style="background:var(--terracotta-light); color:var(--terracotta); padding:2px 7px; border-radius:12px; font-size:0.68rem; font-weight:600;">${c}</span>`).join('')}
           ${item.yarnColors.length > 3 ? `<span style="font-size:0.68rem;">+${item.yarnColors.length - 3}</span>` : ''}
         </div>`
      : '';

    const badgeHtml = item.badge 
      ? `<span class="card-badge">${item.badge}</span>` 
      : (item.inStock ? `<span class="card-badge" style="color:var(--sage);">In Stock</span>` : `<span class="card-badge" style="color:#C62828;">Made to Order</span>`);

    return `
      <div class="product-card" data-id="${item.id}">
        <div class="card-media">
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800'"/>
          ${badgeHtml}
          <a href="${item.instagramPost || 'https://www.instagram.com/dreammoonbyheena'}" target="_blank" rel="noopener" class="card-insta-link" title="View on Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
        <div class="card-body">
          <div class="card-category">${item.categoryName || item.category}</div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc">${item.description}</p>
          ${swatchesHtml}
          <div class="card-footer">
            <div class="card-price-wrap">
              <span class="card-price">₹${item.price}</span>
              ${item.originalPrice ? `<span class="card-original-price">₹${item.originalPrice}</span>` : ''}
            </div>
            <button class="card-action-btn" onclick="openOrderModal('${item.id}')">
              <span>Order / Inquire</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   5. Inquiry Modal & WhatsApp Link
   ========================================================================== */
window.openOrderModal = function(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;

  selectedProductForInquiry = item;
  selectedColorway = (item.yarnColors && item.yarnColors.length > 0) ? item.yarnColors[0] : 'Standard Color';

  document.getElementById('modalItemThumb').src = item.image;
  document.getElementById('modalItemTitle').innerText = item.title;
  document.getElementById('modalItemPrice').innerText = `₹${item.price}`;

  const colorContainer = document.getElementById('modalColorOptions');
  if (item.yarnColors && item.yarnColors.length > 0) {
    colorContainer.innerHTML = item.yarnColors.map((color, index) => `
      <div class="color-chip ${index === 0 ? 'selected' : ''}" onclick="selectColorChip(this, '${color}')">
        ${color}
      </div>
    `).join('') + `<div class="color-chip" onclick="selectColorChip(this, 'Custom Request')">Custom Request</div>`;
  } else {
    colorContainer.innerHTML = `<div class="color-chip selected">As Shown on Instagram</div>`;
  }

  inquiryModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.selectColorChip = function(el, color) {
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedColorway = color;
};

function setupInquiryModal() {
  const closeBtn = document.getElementById('closeModalBtn');
  const overlay = document.getElementById('inquiryModal');
  const whatsappBtn = document.getElementById('sendWhatsappBtn');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOrderModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOrderModal();
    }
  });

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const city = document.getElementById('customerCity').value.trim();
      const note = document.getElementById('customerNotes').value.trim();

      if (!name) {
        showToast("Please enter your name for the order inquiry.");
        document.getElementById('customerName').focus();
        return;
      }

      const storePhone = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.whatsappNumber) 
        ? STORE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '') 
        : '919876543210';

      const message = `🌸 *New Order Inquiry - Dream Moon by Heena*\n\n` +
        `*Product:* ${selectedProductForInquiry ? selectedProductForInquiry.title : 'Custom Yarn Jewellery'}\n` +
        `*Code:* #${selectedProductForInquiry ? selectedProductForInquiry.id : 'N/A'}\n` +
        `*Price:* ₹${selectedProductForInquiry ? selectedProductForInquiry.price : ''}\n` +
        `*Selected Colorway:* ${selectedColorway}\n\n` +
        `*Customer Details:*\n` +
        `• Name: ${name}\n` +
        `• WhatsApp / Phone: ${phone || 'Not provided'}\n` +
        `• City / Location: ${city || 'Not provided'}\n` +
        (note ? `• Custom Notes: ${note}\n\n` : '\n') +
        `_Sent via dreammoon web store inquiry_`;

      const encodedUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(message)}`;
      
      saveInquiryLocally({
        product: selectedProductForInquiry ? selectedProductForInquiry.title : '',
        price: selectedProductForInquiry ? selectedProductForInquiry.price : 0,
        color: selectedColorway,
        customer: name,
        phone,
        city,
        note,
        date: new Date().toISOString(),
        source: 'WhatsApp'
      });

      window.open(encodedUrl, '_blank');
      closeOrderModal();
      showToast("Redirecting to WhatsApp to send your inquiry!");
    });
  }

  if (submitInquiryBtn) {
    submitInquiryBtn.addEventListener('click', () => {
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const city = document.getElementById('customerCity').value.trim();
      const note = document.getElementById('customerNotes').value.trim();

      if (!name || !phone) {
        showToast("Please provide your name and WhatsApp/Phone number.");
        return;
      }

      const inquiryId = `DM-${Math.floor(1000 + Math.random() * 9000)}`;

      saveInquiryLocally({
        inquiryId,
        product: selectedProductForInquiry ? selectedProductForInquiry.title : '',
        price: selectedProductForInquiry ? selectedProductForInquiry.price : 0,
        color: selectedColorway,
        customer: name,
        phone,
        city,
        note,
        date: new Date().toISOString(),
        source: 'Website Form'
      });

      closeOrderModal();
      showToast(`Inquiry #${inquiryId} submitted successfully! Heena will contact you soon.`);
    });
  }
}

function closeOrderModal() {
  inquiryModal.classList.remove('active');
  document.body.style.overflow = '';
}

function saveInquiryLocally(inquiry) {
  try {
    const existing = JSON.parse(localStorage.getItem('dreammoon_inquiries') || '[]');
    existing.unshift(inquiry);
    localStorage.setItem('dreammoon_inquiries', JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save inquiry:", e);
  }
}

function showToast(message) {
  if (!toastNotice) return;
  toastNotice.innerText = message;
  toastNotice.classList.add('show');
  setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 3600);
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   6. Interactive "Make Your Own 3-Piece Gift Box" Studio
   ========================================================================== */
let studioState = {
  earring: { name: 'Sunflower Dangles', price: 349 },
  hair: { name: 'Floral Claw Clip', price: 279 },
  palette: 'Warm Terracotta & Mustard',
  discount: 150
};

window.selectStudioOption = function(category, idx, name, price, el) {
  if (category === 'earring') {
    studioState.earring = { name, price };
  } else if (category === 'hair') {
    studioState.hair = { name, price };
  }

  if (el) {
    const parentRow = el.closest('.studio-options-row');
    if (parentRow) {
      parentRow.querySelectorAll('.studio-option-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    }
  }

  updateStudioSummary();
};

window.selectStudioPalette = function(paletteName, el) {
  studioState.palette = paletteName;
  if (el) {
    el.parentElement.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }
  updateStudioSummary();
};

function updateStudioSummary() {
  const elEarring = document.getElementById('summaryEarring');
  const elEarringPrice = document.getElementById('summaryEarringPrice');
  const elHair = document.getElementById('summaryHair');
  const elHairPrice = document.getElementById('summaryHairPrice');
  const elPalette = document.getElementById('summaryPalette');
  const elTotal = document.getElementById('summaryTotal');

  if (elEarring) elEarring.innerText = `1x ${studioState.earring.name}`;
  if (elEarringPrice) elEarringPrice.innerText = `₹${studioState.earring.price}`;
  if (elHair) elHair.innerText = `1x ${studioState.hair.name}`;
  if (elHairPrice) elHairPrice.innerText = `₹${studioState.hair.price}`;
  if (elPalette) elPalette.innerText = `Palette: ${studioState.palette}`;

  const total = Math.max(0, studioState.earring.price + studioState.hair.price - studioState.discount);
  if (elTotal) elTotal.innerText = `₹${total}`;
}

window.orderStudioBox = function() {
  const total = Math.max(0, studioState.earring.price + studioState.hair.price - studioState.discount);
  const storePhone = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.whatsappNumber) 
    ? STORE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '') 
    : '919876543210';

  const message = `🎁 *Custom 3-Piece Gift Box Order - Dream Moon by Heena*\n\n` +
    `Hello Heena! I have built a custom gift box on your website studio:\n\n` +
    `*Box Inclusions:*\n` +
    `1. ${studioState.earring.name} (₹${studioState.earring.price})\n` +
    `2. ${studioState.hair.name} (₹${studioState.hair.price})\n` +
    `3. Yarn Theme Palette: ${studioState.palette}\n` +
    `• Special Bundle Discount: -₹${studioState.discount}\n` +
    `*Combo Total:* ₹${total}\n\n` +
    `Includes floral gift packaging & handwritten card. Please confirm delivery timeline!`;

  const encodedUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(message)}`;

  saveInquiryLocally({
    product: `Custom 3-Piece Box (${studioState.earring.name} + ${studioState.hair.name})`,
    price: total,
    color: studioState.palette,
    customer: 'Gift Studio Customer',
    phone: '',
    city: '',
    note: 'Interactive Studio Combo',
    date: new Date().toISOString(),
    source: 'Gift Studio WhatsApp'
  });

  window.open(encodedUrl, '_blank');
  showToast("Opening WhatsApp with your bespoke gift box!");
};
