/**
 * Dream Moon by Heena - Client Storefront Application
 */

// Application State
let products = [];
let activeCategory = 'all';
let inquiryBag = [];
let selectedProductForInquiry = null;
let selectedColorway = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const categoryFilters = document.getElementById('categoryFilters');
const bagCountBadge = document.getElementById('bagCount');
const inquiryModal = document.getElementById('inquiryModal');
const toastNotice = document.getElementById('toastNotice');

// Initialize Store
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  setupCategoryFilters();
  renderProducts();
  setupInquiryModal();
  updateBagCount();
  setupSmoothScrolling();
});

/**
 * Load products with prioritized fallbacks
 */
async function loadProducts() {
  // 1. Check local storage for any live admin edits
  const localData = localStorage.getItem('dreammoon_products');
  if (localData) {
    try {
      products = JSON.parse(localData);
      return;
    } catch (e) {
      console.warn("Couldn't parse local product cache:", e);
    }
  }

  // 2. Attempt fetching data/products.json
  try {
    const res = await fetch('data/products.json');
    if (res.ok) {
      products = await res.json();
      return;
    }
  } catch (err) {
    console.log("Local fetch unavailable, falling back to embedded catalog data");
  }

  // 3. Fallback to DEFAULT_PRODUCTS from data.js
  if (typeof DEFAULT_PRODUCTS !== 'undefined' && Array.isArray(DEFAULT_PRODUCTS)) {
    products = DEFAULT_PRODUCTS;
  }
}

/**
 * Setup category filter tabs
 */
function setupCategoryFilters() {
  if (!categoryFilters) return;

  const buttons = categoryFilters.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderProducts();
    });
  });
}

/**
 * Render product cards based on active filter
 */
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
           <span>Colors:</span>
           ${item.yarnColors.slice(0, 3).map(c => `<span class="swatch-text" style="background:#F2EBE3; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:600;">${c}</span>`).join('')}
           ${item.yarnColors.length > 3 ? `<span style="font-size:0.7rem;">+${item.yarnColors.length - 3}</span>` : ''}
         </div>`
      : '';

    const badgeHtml = item.badge 
      ? `<span class="card-badge">${item.badge}</span>` 
      : (item.inStock ? `<span class="card-badge" style="color:var(--sage);">In Stock</span>` : `<span class="card-badge" style="color:#C62828;">Made to Order</span>`);

    return `
      <div class="product-card" data-id="${item.id}">
        <div class="card-media">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
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

/**
 * Open Inquiry Modal with pre-selected item
 */
window.openOrderModal = function(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;

  selectedProductForInquiry = item;
  selectedColorway = (item.yarnColors && item.yarnColors.length > 0) ? item.yarnColors[0] : 'Standard Color';

  // Populate preview
  document.getElementById('modalItemThumb').src = item.image;
  document.getElementById('modalItemTitle').innerText = item.title;
  document.getElementById('modalItemPrice').innerText = `₹${item.price}`;

  // Populate color chips
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

  // Open modal
  inquiryModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.selectColorChip = function(el, color) {
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedColorway = color;
};

/**
 * Setup Inquiry Modal event listeners
 */
function setupInquiryModal() {
  const closeBtn = document.getElementById('closeModalBtn');
  const overlay = document.getElementById('inquiryModal');
  const whatsappBtn = document.getElementById('sendWhatsappBtn');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOrderModal);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOrderModal();
    });
  }

  // Escape key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOrderModal();
    }
  });

  // WhatsApp Order Submission
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
        `*Code:* ${selectedProductForInquiry ? selectedProductForInquiry.id : 'N/A'}\n` +
        `*Price:* ₹${selectedProductForInquiry ? selectedProductForInquiry.price : ''}\n` +
        `*Selected Color/Thread:* ${selectedColorway}\n\n` +
        `*Customer Details:*\n` +
        `• Name: ${name}\n` +
        `• Contact Phone: ${phone || 'Not provided'}\n` +
        `• City / Location: ${city || 'Not provided'}\n` +
        (note ? `• Custom Note: ${note}\n\n` : '\n') +
        `_Sent via dreammoon web store inquiry_`;

      const encodedUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(message)}`;
      
      // Also log inquiry locally
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

  // Direct Form Inquiry Submission
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

/**
 * Save inquiry to local storage for Admin to review
 */
function saveInquiryLocally(inquiry) {
  try {
    const existing = JSON.parse(localStorage.getItem('dreammoon_inquiries') || '[]');
    existing.unshift(inquiry);
    localStorage.setItem('dreammoon_inquiries', JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save inquiry:", e);
  }
}

/**
 * Toast notifications
 */
function showToast(message) {
  if (!toastNotice) return;
  toastNotice.innerText = message;
  toastNotice.classList.add('show');
  setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 4000);
}

function updateBagCount() {
  if (bagCountBadge) {
    bagCountBadge.innerText = inquiryBag.length;
  }
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
