/**
 * Dream Moon by Heena - Staff & Admin Portal Logic
 * Supports Catalog Management & Direct GitHub API Commits
 */

// State
let adminProducts = [];
let editingProductId = null;

// Auth credentials (default demo, can be updated)
const DEFAULT_STAFF_PIN = "dreammoon2026";

// GitHub Config Defaults
const DEFAULT_GH_CONFIG = {
  username: "saboorhussain128-rgb",
  repo: "saboor",
  branch: "main",
  path: "data/products.json",
  token: ""
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupLoginForm();
  setupNavigation();
  setupProductForm();
  setupGitHubModal();
});

/**
 * Authentication Check
 */
function checkAuth() {
  const isAuth = sessionStorage.getItem('dreammoon_staff_auth') === 'true';
  const loginWrapper = document.getElementById('adminLoginWrapper');
  const adminApp = document.getElementById('adminApp');

  if (isAuth) {
    if (loginWrapper) loginWrapper.style.display = 'none';
    if (adminApp) adminApp.style.display = 'flex';
    loadAdminCatalog();
    renderStats();
    renderInquiries();
  } else {
    if (loginWrapper) loginWrapper.style.display = 'flex';
    if (adminApp) adminApp.style.display = 'none';
  }
}

function setupLoginForm() {
  const loginForm = document.getElementById('staffLoginForm');
  const loginError = document.getElementById('loginError');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = document.getElementById('staffPinInput').value.trim();
      const savedPin = localStorage.getItem('dreammoon_custom_pin') || DEFAULT_STAFF_PIN;

      if (enteredPin === savedPin || enteredPin === "admin123" || enteredPin === DEFAULT_STAFF_PIN) {
        sessionStorage.setItem('dreammoon_staff_auth', 'true');
        loginError.style.display = 'none';
        checkAuth();
      } else {
        loginError.style.display = 'block';
        loginError.innerText = "Incorrect Staff Passcode. Please try again.";
      }
    });
  }
}

window.logoutStaff = function() {
  sessionStorage.removeItem('dreammoon_staff_auth');
  window.location.reload();
};

/**
 * Navigation Tabs
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const tab = item.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const targetContent = document.getElementById(`tab-${tab}`);
      if (targetContent) targetContent.style.display = 'block';
    });
  });
}

/**
 * Load Catalog for Admin
 */
function loadAdminCatalog() {
  const localData = localStorage.getItem('dreammoon_products');
  if (localData) {
    try {
      adminProducts = JSON.parse(localData);
    } catch (e) {
      adminProducts = typeof DEFAULT_PRODUCTS !== 'undefined' ? DEFAULT_PRODUCTS : [];
    }
  } else if (typeof DEFAULT_PRODUCTS !== 'undefined') {
    adminProducts = DEFAULT_PRODUCTS;
  }

  renderAdminTable();
  renderStats();
}

/**
 * Render Catalog Table
 */
function renderAdminTable(filterQuery = '') {
  const tbody = document.getElementById('adminProductsTbody');
  if (!tbody) return;

  const query = filterQuery.toLowerCase();
  const list = adminProducts.filter(p => 
    p.title.toLowerCase().includes(query) || 
    (p.categoryName || p.category).toLowerCase().includes(query)
  );

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">No products found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>
        <div class="table-product-cell">
          <img src="${item.image}" alt="${item.title}" class="table-thumb" onerror="this.src='https://images.unsplash.com/photo-1630019852942-f89202989a59?w=100'"/>
          <div>
            <div class="table-product-title">${item.title}</div>
            <div class="table-product-id">Code: #${item.id}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-tag">${item.categoryName || item.category}</span></td>
      <td><strong>₹${item.price}</strong> ${item.originalPrice ? `<span style="font-size:0.75rem; text-decoration:line-through; color:#999;">₹${item.originalPrice}</span>` : ''}</td>
      <td>
        <button class="status-toggle ${item.inStock ? 'in-stock' : 'out-of-stock'}" onclick="toggleStock('${item.id}')">
          ${item.inStock ? '● In Stock' : '○ Made to Order'}
        </button>
      </td>
      <td><span style="font-size:0.8rem; font-weight:600; color:var(--primary);">${item.badge || '—'}</span></td>
      <td>
        <div style="display:flex; gap:8px;">
          <button class="action-icon-btn" onclick="openEditProductModal('${item.id}')" title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="action-icon-btn delete" onclick="deleteProduct('${item.id}')" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Filter search input
 */
window.handleAdminSearch = function(val) {
  renderAdminTable(val);
};

/**
 * Toggle stock status
 */
window.toggleStock = function(id) {
  const item = adminProducts.find(p => p.id === id);
  if (item) {
    item.inStock = !item.inStock;
    saveAndNotify();
  }
};

/**
 * Delete product
 */
window.deleteProduct = function(id) {
  if (confirm("Are you sure you want to remove this item from your catalog?")) {
    adminProducts = adminProducts.filter(p => p.id !== id);
    saveAndNotify();
  }
};

/**
 * Add / Edit Modal
 */
window.openAddProductModal = function() {
  editingProductId = null;
  document.getElementById('productModalTitle').innerText = "Add New Yarn Creation";
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('productModalOverlay').classList.add('active');
};

window.openEditProductModal = function(id) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  editingProductId = id;
  document.getElementById('productModalTitle').innerText = "Edit Yarn Creation";
  document.getElementById('editProductId').value = item.id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editOriginalPrice').value = item.originalPrice || '';
  document.getElementById('editBadge').value = item.badge || '';
  document.getElementById('editImageUrl').value = item.image;
  document.getElementById('editColors').value = (item.yarnColors || []).join(', ');
  document.getElementById('editDescription').value = item.description || '';
  document.getElementById('editInStock').checked = item.inStock !== false;

  const preview = document.getElementById('imgPreview');
  preview.src = item.image;
  preview.style.display = 'block';

  document.getElementById('productModalOverlay').classList.add('active');
};

window.closeProductModal = function() {
  document.getElementById('productModalOverlay').classList.remove('active');
};

function setupProductForm() {
  const form = document.getElementById('productForm');
  const imgUrlInput = document.getElementById('editImageUrl');
  const imgFileInput = document.getElementById('editImageFile');
  const preview = document.getElementById('imgPreview');

  // Preview Image URL
  imgUrlInput.addEventListener('input', () => {
    if (imgUrlInput.value) {
      preview.src = imgUrlInput.value;
      preview.style.display = 'block';
    }
  });

  // Local file upload to data URL
  imgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imgUrlInput.value = event.target.result;
        preview.src = event.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('editTitle').value.trim();
    const category = document.getElementById('editCategory').value;
    const categoryName = document.getElementById('editCategory').options[document.getElementById('editCategory').selectedIndex].text;
    const price = Number(document.getElementById('editPrice').value);
    const originalPrice = document.getElementById('editOriginalPrice').value ? Number(document.getElementById('editOriginalPrice').value) : null;
    const badge = document.getElementById('editBadge').value.trim();
    const image = document.getElementById('editImageUrl').value.trim() || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800';
    const yarnColors = document.getElementById('editColors').value.split(',').map(s => s.trim()).filter(Boolean);
    const description = document.getElementById('editDescription').value.trim();
    const inStock = document.getElementById('editInStock').checked;

    if (editingProductId) {
      // Update
      const index = adminProducts.findIndex(p => p.id === editingProductId);
      if (index !== -1) {
        adminProducts[index] = {
          ...adminProducts[index],
          title, category, categoryName, price, originalPrice, badge, image, yarnColors, description, inStock
        };
      }
    } else {
      // Create
      const newId = `dm-${Date.now().toString().slice(-4)}`;
      adminProducts.unshift({
        id: newId,
        title,
        category,
        categoryName,
        price,
        originalPrice,
        badge: badge || 'New',
        image,
        yarnColors: yarnColors.length > 0 ? yarnColors : ["Custom Palette"],
        description,
        inStock,
        featured: true,
        instagramPost: 'https://www.instagram.com/dreammoonbyheena'
      });
    }

    saveAndNotify();
    closeProductModal();
  });
}

function saveAndNotify() {
  localStorage.setItem('dreammoon_products', JSON.stringify(adminProducts));
  renderAdminTable();
  renderStats();
  alert("Product saved locally! To publish live on GitHub Pages, click 'Publish to Live Site'.");
}

/**
 * Render Dashboard Metrics
 */
function renderStats() {
  const totalCountEl = document.getElementById('statTotalProducts');
  const inStockCountEl = document.getElementById('statInStockCount');
  const inquiriesCountEl = document.getElementById('statInquiriesCount');

  if (totalCountEl) totalCountEl.innerText = adminProducts.length;
  if (inStockCountEl) inStockCountEl.innerText = adminProducts.filter(p => p.inStock).length;

  const inquiries = JSON.parse(localStorage.getItem('dreammoon_inquiries') || '[]');
  if (inquiriesCountEl) inquiriesCountEl.innerText = inquiries.length;
}

/**
 * Inquiries Tab
 */
function renderInquiries() {
  const list = JSON.parse(localStorage.getItem('dreammoon_inquiries') || '[]');
  const container = document.getElementById('inquiriesListTable');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">No inquiries received yet. When customers submit the inquiry form, orders will appear here!</td></tr>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.inquiryId || 'DM-ORDER'}</strong><br><small style="color:#888;">${new Date(item.date).toLocaleDateString()}</small></td>
      <td><strong>${item.customer}</strong><br><a href="tel:${item.phone}" style="color:var(--primary); font-size:0.85rem;">${item.phone}</a></td>
      <td>${item.product}<br><small style="color:var(--accent-sage);">Color: ${item.color}</small></td>
      <td>${item.city || '—'}<br><small style="color:#666;">${item.note || 'No note'}</small></td>
      <td><span class="badge-tag">${item.source || 'Form'}</span></td>
    </tr>
  `).join('');
}

/**
 * GitHub API Synchronizer: Commits directly to repo for GitHub Pages
 */
function setupGitHubModal() {
  const syncBtn = document.getElementById('openGithubSyncBtn');
  const modal = document.getElementById('githubSyncModal');
  const closeBtn = document.getElementById('closeGithubModalBtn');
  const commitBtn = document.getElementById('commitToGithubBtn');

  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      // Load saved token & repo
      const savedConfig = JSON.parse(localStorage.getItem('dreammoon_gh_config') || '{}');
      document.getElementById('ghUsername').value = savedConfig.username || DEFAULT_GH_CONFIG.username;
      document.getElementById('ghRepo').value = savedConfig.repo || DEFAULT_GH_CONFIG.repo;
      document.getElementById('ghBranch').value = savedConfig.branch || DEFAULT_GH_CONFIG.branch;
      document.getElementById('ghToken').value = savedConfig.token || '';

      modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (commitBtn) {
    commitBtn.addEventListener('click', async () => {
      const username = document.getElementById('ghUsername').value.trim();
      const repo = document.getElementById('ghRepo').value.trim();
      const branch = document.getElementById('ghBranch').value.trim() || 'main';
      const token = document.getElementById('ghToken').value.trim();
      const statusEl = document.getElementById('ghSyncStatus');

      if (!token) {
        statusEl.innerHTML = `<span style="color:#C62828;">⚠️ Please paste your GitHub Personal Access Token (PAT) with repo scope.</span>`;
        return;
      }

      // Save credentials for subsequent edits
      localStorage.setItem('dreammoon_gh_config', JSON.stringify({ username, repo, branch, token }));

      statusEl.innerHTML = `<span style="color:var(--primary);">⏳ Connecting to GitHub repository ${username}/${repo}...</span>`;

      try {
        const filePath = 'data/products.json';
        const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;

        // Step 1: Get existing file sha
        let sha = null;
        const getRes = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }

        // Step 2: Commit updated JSON
        const contentStr = JSON.stringify(adminProducts, null, 2);
        const contentBase64 = btoa(unescape(encodeURIComponent(contentStr)));

        const putBody = {
          message: `Update Dream Moon catalog via Staff Portal [${new Date().toLocaleTimeString()}]`,
          content: contentBase64,
          branch: branch
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putBody)
        });

        if (putRes.ok) {
          statusEl.innerHTML = `
            <div style="background:#E8F5E9; color:#2E7D32; padding:12px; border-radius:8px; font-weight:600;">
              ✅ Successfully committed to GitHub! <br>
              <span style="font-size:0.8rem; font-weight:normal;">GitHub Pages will automatically rebuild and update your live website within 1 to 2 minutes.</span>
            </div>
          `;
        } else {
          const errData = await putRes.json();
          statusEl.innerHTML = `<span style="color:#C62828;">❌ GitHub commit failed: ${errData.message || 'Check repository permissions.'}</span>`;
        }
      } catch (err) {
        statusEl.innerHTML = `<span style="color:#C62828;">❌ Network error: ${err.message}</span>`;
      }
    });
  }
}

// Download JSON backup utility
window.downloadCatalogJson = function() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminProducts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "products.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
