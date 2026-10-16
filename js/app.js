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
  init3DHeroCanvas();
  renderLookbookDisplay();
  highlightHotspot(1);
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
   3. Real 3D Interactive Three.js WebGL Hero Jewel Engine
   ========================================================================== */
let threeScene, threeCamera, threeRenderer;
let mainYarnKnot, knotWireframe, goldHoopRing, pearlsGroup, fiberParticles;
let yarnMaterial, goldMaterial, pearlMaterial;
let isDragging3D = false;
let previousPointerPos = { x: 0, y: 0 };
let targetRotation = { x: 0.2, y: 0.4 };
let currentRotation = { x: 0.2, y: 0.4 };
let rotationVelocity = { x: 0.002, y: 0.004 };
let targetColorHex = 0xD89838; // Default Mustard Yellow
let currentColorObj = null;
let threeAnimationId = null;

const YARN_PALETTES = {
  mustard: 0xD89838,
  terracotta: 0xC36B4E,
  sage: 0x6E846B,
  rose: 0xD98880,
  cream: 0xEFE6DD
};

function init3DHeroCanvas() {
  const container = document.getElementById('hero3dStage');
  const canvas = document.getElementById('hero3dCanvas');
  if (!container || !canvas || typeof THREE === 'undefined') {
    return;
  }

  const width = container.clientWidth || 460;
  const height = container.clientHeight || 520;

  // Scene
  threeScene = new THREE.Scene();

  // Camera
  threeCamera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  threeCamera.position.set(0, 0, 7.8);

  // Renderer
  threeRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeRenderer.toneMappingExposure = 1.15;

  // Materials
  currentColorObj = new THREE.Color(targetColorHex);
  yarnMaterial = new THREE.MeshStandardMaterial({
    color: currentColorObj,
    roughness: 0.65,
    metalness: 0.14
  });

  const detailMat = new THREE.MeshStandardMaterial({
    color: 0xFFF2D1,
    roughness: 0.9,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xEBB852,
    metalness: 0.92,
    roughness: 0.16
  });

  pearlMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFDF7,
    roughness: 0.22,
    metalness: 0.18
  });

  // 1. Central 3D Yarn Knot Sculpture
  const knotGeo = new THREE.TorusKnotGeometry(1.45, 0.48, 120, 28, 2, 3);
  mainYarnKnot = new THREE.Mesh(knotGeo, yarnMaterial);
  threeScene.add(mainYarnKnot);

  // Accent detail mesh
  const knotDetailGeo = new THREE.TorusKnotGeometry(1.46, 0.49, 48, 16, 2, 3);
  knotWireframe = new THREE.Mesh(knotDetailGeo, detailMat);
  mainYarnKnot.add(knotWireframe);

  // 2. 18K Gold Outer Orbit Ring
  const goldRingGeo = new THREE.TorusGeometry(2.65, 0.045, 16, 100);
  goldHoopRing = new THREE.Mesh(goldRingGeo, goldMaterial);
  goldHoopRing.rotation.x = Math.PI / 3;
  threeScene.add(goldHoopRing);

  // 3. Orbiting Seed Pearl Constellation
  pearlsGroup = new THREE.Group();
  const pearlGeo = new THREE.SphereGeometry(0.13, 16, 16);
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const radius = 2.65;
    const pearl = new THREE.Mesh(pearlGeo, pearlMaterial);
    pearl.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.sin(angle * 2) * 0.4));
    pearlsGroup.add(pearl);
  }
  goldHoopRing.add(pearlsGroup);

  // 4. Floating Golden Fiber Particles
  const particleCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 8;
    particlePositions[i + 1] = (Math.random() - 0.5) * 8;
    particlePositions[i + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xF7D070,
    size: 0.06,
    transparent: true,
    opacity: 0.6
  });
  fiberParticles = new THREE.Points(particleGeo, particleMat);
  threeScene.add(fiberParticles);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xFFF9F2, 1.3);
  threeScene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xFFF2DC, 1.7);
  mainLight.position.set(6, 8, 6);
  threeScene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0xD97E62, 1.3);
  rimLight.position.set(-6, -4, -4);
  threeScene.add(rimLight);

  const topSpot = new THREE.PointLight(0xFFEAA7, 1.5, 15);
  topSpot.position.set(0, 5, 2);
  threeScene.add(topSpot);

  // Pointer event listeners for 3D Drag & Touch
  setup3DInteraction(container);

  // Render loop
  animate3DHero();

  // Resize handler
  window.addEventListener('resize', onWindowResize3D);
}

function setup3DInteraction(container) {
  let isPointerDown = false;

  container.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    previousPointerPos = { x: e.clientX, y: e.clientY };
    container.classList.add('grabbing');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) {
      const rect = container.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      if (mouseX >= -0.5 && mouseX <= 0.5 && mouseY >= -0.5 && mouseY <= 0.5) {
        targetRotation.y += mouseX * 0.015;
        targetRotation.x += mouseY * 0.015;
      }
      return;
    }

    const deltaX = e.clientX - previousPointerPos.x;
    const deltaY = e.clientY - previousPointerPos.y;
    previousPointerPos = { x: e.clientX, y: e.clientY };

    targetRotation.y += deltaX * 0.012;
    targetRotation.x += deltaY * 0.012;
    rotationVelocity = { x: deltaY * 0.001, y: deltaX * 0.001 };
  });

  window.addEventListener('pointerup', () => {
    if (isPointerDown) {
      isPointerDown = false;
      container.classList.remove('grabbing');
    }
  });

  container.addEventListener('click', () => {
    pulse3DJewel();
  });
}

function pulse3DJewel() {
  if (!mainYarnKnot) return;
  let scale = 1.15;
  mainYarnKnot.scale.set(scale, scale, scale);
  const snapBack = () => {
    scale += (1.0 - scale) * 0.12;
    mainYarnKnot.scale.set(scale, scale, scale);
    if (Math.abs(scale - 1.0) > 0.005) {
      requestAnimationFrame(snapBack);
    } else {
      mainYarnKnot.scale.set(1, 1, 1);
    }
  };
  requestAnimationFrame(snapBack);
}

window.morph3DYarnColor = function(paletteKey, buttonEl) {
  const hex = YARN_PALETTES[paletteKey];
  if (!hex) return;
  targetColorHex = hex;

  document.querySelectorAll('.hero-palette-dot').forEach(b => b.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');

  pulse3DJewel();
  showToast(`3D Yarn Swatch: ${paletteKey.charAt(0).toUpperCase() + paletteKey.slice(1)}`);
};

function animate3DHero() {
  threeAnimationId = requestAnimationFrame(animate3DHero);

  if (!threeRenderer || !threeScene || !threeCamera) return;

  targetRotation.y += rotationVelocity.y;
  targetRotation.x += rotationVelocity.x;
  rotationVelocity.x *= 0.95;
  rotationVelocity.y = (rotationVelocity.y - 0.004) * 0.95 + 0.004;

  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

  if (mainYarnKnot) {
    mainYarnKnot.rotation.x = currentRotation.x;
    mainYarnKnot.rotation.y = currentRotation.y;
    mainYarnKnot.rotation.z += 0.0015;
  }

  if (goldHoopRing) {
    goldHoopRing.rotation.z += 0.004;
    goldHoopRing.rotation.y = currentRotation.y * 0.5;
  }

  if (fiberParticles) {
    fiberParticles.rotation.y += 0.001;
    fiberParticles.rotation.x += 0.0005;
  }

  if (yarnMaterial && currentColorObj) {
    const targetObj = new THREE.Color(targetColorHex);
    currentColorObj.lerp(targetObj, 0.06);
    yarnMaterial.color.copy(currentColorObj);
  }

  threeRenderer.render(threeScene, threeCamera);
}

function onWindowResize3D() {
  const container = document.getElementById('hero3dStage');
  if (!container || !threeCamera || !threeRenderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(width, height);
}

/* ==========================================================================
   4. The Haute Lookbook Reel (Editorial Magazine Showcase)
   ========================================================================== */
const LOOKBOOK_ITEMS = [
  {
    num: "01",
    tag: "Exhibition Hero",
    title: "Boho Sunflower Yarn Drop Earrings",
    sub: "Featherlight Organic Cotton Sunbursts",
    desc: "Handcrafted petal-by-petal in Hyderabad using double-twisted combed cotton yarn. Secured with hypoallergenic 18K gold-plated french hooks. Featured at the Aangan & Noor-e-Umaish exhibition stalls.",
    price: 349,
    originalPrice: 499,
    specs: {
      craftTime: "2.5 Hours",
      thread: "Combed Organic Cotton",
      hardware: "18K Gold Plated",
      weight: "12g (Featherlight)"
    },
    colors: ["Mustard Gold", "Warm Terracotta", "Olive Sage"],
    img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
    id: "dm-001"
  },
  {
    num: "02",
    tag: "Artisan Collar",
    title: "Terracotta Daisy Crochet Choker",
    sub: "Micro-Woven Scalloped Neckpiece",
    desc: "Intricately hand-crocheted daisy blossoms centered with delicate seed pearls. Finished with adjustable ivory silk thread ties that adapt comfortably to any neckline.",
    price: 499,
    originalPrice: 699,
    specs: {
      craftTime: "4.0 Hours",
      thread: "Mercerized Fiber Cotton",
      hardware: "Natural Seed Pearls",
      weight: "18g Soft-Touch"
    },
    colors: ["Warm Terracotta", "Ivory Cream", "Dusty Pink"],
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    id: "dm-002"
  },
  {
    num: "03",
    tag: "Hair Couture",
    title: "Floral Blossom Yarn Claw Clip",
    sub: "French Matte Finish With 3D Blooms",
    desc: "Non-slip matte French hair clip embellished with 3-dimensional hand-crocheted sakura blossoms and tiny moss leaf accents. High tension spring designed for all hair textures.",
    price: 279,
    originalPrice: 380,
    specs: {
      craftTime: "1.5 Hours",
      thread: "Pastel Acrylic-Cotton",
      hardware: "Matte Non-Slip Clip",
      weight: "24g Firm Grip"
    },
    colors: ["Olive Sage", "Cherry Blossom", "Lilac Cloud"],
    img: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=900&q=85",
    id: "dm-004"
  },
  {
    num: "04",
    tag: "Luxury Keepsake",
    title: "Pastel Satin-Yarn Scrunchie Duo",
    sub: "Scalloped Hand-Knit Silk Borders",
    desc: "Premium mulberry satin scrunchie wrapped in delicate hand-knit scalloped yarn edges. Zero hair friction, zero breakage, and a gorgeous floral statement on your wrist.",
    price: 229,
    originalPrice: 320,
    specs: {
      craftTime: "1.0 Hour",
      thread: "Combed Fluff Yarn + Silk",
      hardware: "Elastic Grip Core",
      weight: "16g Anti-Frizz"
    },
    colors: ["Blush Rose", "Champagne Cream", "Sky Mist"],
    img: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=85",
    id: "dm-003"
  },
  {
    num: "05",
    tag: "Personalized",
    title: "Custom Initial Charm Wrap Bracelet",
    sub: "Beaded Thread Wrap with Gold Letter",
    desc: "Woven macramé cotton cord threaded with gold letter charm of your choice and iridescent seed beads. Water-resistant, adjustable slide knot fits every wrist size.",
    price: 299,
    originalPrice: 399,
    specs: {
      craftTime: "1.8 Hours",
      thread: "Waxed Cotton Thread",
      hardware: "Brass Initial Charm",
      weight: "8g Barely-There"
    },
    colors: ["Ivory Cream", "Midnight Black", "Sage Green"],
    img: "https://images.unsplash.com/photo-1611591475155-42ac62973e0c?auto=format&fit=crop&w=900&q=85",
    id: "dm-006"
  },
  {
    num: "06",
    tag: "Curated Set",
    title: "Bespoke 4-Piece Pop-Up Gift Hamper",
    sub: "Signature Keepsake Box & Wax Seal Card",
    desc: "The complete artisanal experience: includes 1 Pair Sunflower Dangles, 1 Daisy Choker, 1 Blossom Claw Clip, and 1 Scrunchie, encased in a floral hard-box with handwritten calligraphy card.",
    price: 999,
    originalPrice: 1499,
    specs: {
      craftTime: "6.5 Hours Total",
      thread: "Full Atelier Suite",
      hardware: "Luxury Gift Packaging",
      weight: "Complete Hamper"
    },
    colors: ["Terracotta & Gold", "Pastel Garden", "Bespoke Custom"],
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85",
    id: "dm-008"
  }
];

let activeLookbookIndex = 0;

window.selectLookbookDrop = function(index) {
  activeLookbookIndex = index;
  renderLookbookDisplay();
};

function renderLookbookDisplay() {
  const item = LOOKBOOK_ITEMS[activeLookbookIndex];
  if (!item) return;

  document.querySelectorAll('.lookbook-tab-pill').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === activeLookbookIndex);
  });

  const displayEl = document.getElementById('lookbookSpreadContainer');
  if (!displayEl) return;

  displayEl.innerHTML = `
    <div class="lookbook-spread">
      <!-- Left Editorial Visual -->
      <div class="lookbook-visual-frame">
        <div class="lookbook-img-wrapper">
          <img src="${item.img}" alt="${item.title}" class="lookbook-hero-img" loading="lazy" />
          <div class="lookbook-gold-seal">
            <svg viewBox="0 0 100 100" class="seal-svg">
              <path id="curve" d="M 12 50 A 38 38 0 1 1 88 50 A 38 38 0 1 1 12 50" fill="none" />
              <text><textPath href="#curve" startOffset="0%">DREAM MOON • HYDERABAD • ATELIER •</textPath></text>
            </svg>
            <div class="seal-center">🌙</div>
          </div>
          <span class="lookbook-floating-badge">${item.tag}</span>
        </div>
      </div>

      <!-- Right Editorial Content -->
      <div class="lookbook-editorial-card">
        <div class="lookbook-eyebrow">
          <span>ATELIER EDITION</span>
          <span class="eyebrow-divider">•</span>
          <span>DROP ${item.num} / 06</span>
        </div>

        <h3 class="lookbook-title">${item.title}</h3>
        <div class="lookbook-subtitle">${item.sub}</div>
        <p class="lookbook-desc">${item.desc}</p>

        <!-- Craft Specifications Grid -->
        <div class="lookbook-specs-grid">
          <div class="spec-cell">
            <span class="spec-label">Craft Time</span>
            <span class="spec-val">⏱️ ${item.specs.craftTime}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Thread Fiber</span>
            <span class="spec-val">🧶 ${item.specs.thread}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Fittings</span>
            <span class="spec-val">✨ ${item.specs.hardware}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Wearability</span>
            <span class="spec-val">⚖️ ${item.specs.weight}</span>
          </div>
        </div>

        <!-- Available Colorways -->
        <div class="lookbook-colors-wrap">
          <span class="colors-label">Signature Colorways:</span>
          <div class="colors-list">
            ${item.colors.map(c => `<span class="lookbook-color-tag">${c}</span>`).join('')}
          </div>
        </div>

        <!-- Price & Action CTA -->
        <div class="lookbook-cta-bar">
          <div class="lookbook-price-block">
            <span class="lookbook-price">₹${item.price}</span>
            <span class="lookbook-orig-price">₹${item.originalPrice}</span>
            <span class="lookbook-save-badge">Save ₹${item.originalPrice - item.price}</span>
          </div>

          <div class="lookbook-btn-row">
            <button class="btn-primary" onclick="openOrderModal('${item.id}')">
              <span>Order / Inquire</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Heena!%20I%20am%20interested%20in%20ordering%20the%20${encodeURIComponent(item.title)}%20(₹${item.price})" target="_blank" rel="noopener" class="btn-whatsapp-compact" title="Instant WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* ==========================================================================
   5. Interactive Craft Anatomy Hotspots
   ========================================================================== */
const ANATOMY_HOTSPOTS = [
  {
    id: 1,
    title: "18K Gold Plated Wire Hooks",
    tag: "Hypoallergenic Architecture",
    desc: "100% nickel-free and lead-free gold plate over solid brass. Won't irritate sensitive ears or tarnish over time. Hand-bent into an ergonomic safety curve for all-day comfort.",
    icon: "✨"
  },
  {
    id: 2,
    title: "Double-Twisted Combed Cotton",
    tag: "Organic Pure Fiber",
    desc: "Long-staple organic cotton threads that undergo combing to eliminate short fuzz. Retains vibrant, warm terracotta and mustard dyes without fading.",
    icon: "🧶"
  },
  {
    id: 3,
    title: "Scalloped Crochet Architecture",
    tag: "180 Knot Loops",
    desc: "Every petal is crocheted individually using a micro 1.25mm aluminum hook. 14 overlapping petal stitches create a three-dimensional blossoming effect.",
    icon: "🌸"
  },
  {
    id: 4,
    title: "Hand-Sewn Natural Seed Pearl",
    tag: "Freshwater Luster",
    desc: "The flower core is adorned with a hand-selected freshwater seed pearl, anchored with reinforced invisible nylon thread to withstand daily wear.",
    icon: "🦪"
  }
];

window.highlightHotspot = function(id) {
  const spot = ANATOMY_HOTSPOTS.find(h => h.id === id);
  if (!spot) return;

  document.querySelectorAll('.hotspot-marker').forEach(m => {
    m.classList.toggle('active', parseInt(m.getAttribute('data-id')) === id);
  });

  document.querySelectorAll('.quick-pill').forEach((btn, idx) => {
    btn.classList.toggle('active', (idx + 1) === id);
  });

  const card = document.getElementById('anatomyActiveCard');
  if (card) {
    card.innerHTML = `
      <div class="anatomy-card-icon">${spot.icon}</div>
      <span class="anatomy-card-tag">${spot.tag}</span>
      <h4 class="anatomy-card-title">${spot.title}</h4>
      <p class="anatomy-card-desc">${spot.desc}</p>
    `;
    card.style.opacity = '0.5';
    setTimeout(() => { card.style.opacity = '1'; }, 100);
  }
};

/* ==========================================================================
   6. Products & Catalog Logic
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

  // Velvet Tray Mockup Elements
  const trayEarringTitle = document.getElementById('trayEarringTitle');
  const trayEarringPrice = document.getElementById('trayEarringPrice');
  const trayHairTitle = document.getElementById('trayHairTitle');
  const trayHairPrice = document.getElementById('trayHairPrice');
  const trayPaletteTitle = document.getElementById('trayPaletteTitle');

  if (trayEarringTitle) trayEarringTitle.innerText = studioState.earring.name;
  if (trayEarringPrice) trayEarringPrice.innerText = `₹${studioState.earring.price}`;
  if (trayHairTitle) trayHairTitle.innerText = studioState.hair.name;
  if (trayHairPrice) trayHairPrice.innerText = `₹${studioState.hair.price}`;
  if (trayPaletteTitle) trayPaletteTitle.innerText = `Palette: ${studioState.palette}`;

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
