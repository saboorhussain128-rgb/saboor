# 🌙 Dream Moon by Heena — Handcrafted Yarn Jewellery & Accessories Store

A modern, responsive, aesthetic Boho-Craft Studio e-commerce and order inquiry website built for **Dream Moon by Heena** ([@dreammoonbyheena](https://www.instagram.com/dreammoonbyheena)), specializing in handcrafted yarn jewellery, crochet earrings, floral chokers, cute hair bows, scrunchies, and charm accessories made in Hyderabad, India.

---

## 🎨 Design & Key Features

- **Boho-Craft Studio Aesthetic**: Warm terracotta, sand, cream, and sage tones with textured cards and delicate craftsmanship details.
- **Dynamic Category Filtering**:
  - 🧵 Yarn & Crochet Earrings
  - 🌸 Chokers & Necklaces
  - 🎀 Hair Accessories & Bows
  - 📿 Bracelets & Charms
  - 🚗 Bag & Car Accents
  - 🎁 Gift Bundles & Hampers
- **Customer Order & Inquiry System**:
  - One-click **WhatsApp Direct Order** with pre-filled product title, code, price, and selected thread/yarn colorway.
  - **Online Inquiry Form** for custom bespoke colorway requests with instant local logging and inquiry ID.
- **Shoppable Instagram Grid**:
  - Direct integration linking to the live Instagram page [`@dreammoonbyheena`](https://www.instagram.com/dreammoonbyheena).
- **Staff / Admin Portal (`/admin.html`)**:
  - Discreet **Staff Access** button with lock icon in header and footer.
  - Secure login with staff passcode (Default: `dreammoon2026`).
  - Add, edit, or remove products and update prices/photos in real time.
  - **GitHub API Auto-Publisher**: Click "Publish to Live Site" to commit updates directly to your GitHub repository and automatically update your GitHub Pages deployment!

---

## 📁 Project Structure

```
Jewellery & accessories store/
├── index.html            # Main storefront website
├── admin.html            # Staff & Admin Management Portal
├── README.md             # Documentation & deployment guide
├── css/
│   ├── style.css         # Boho-Craft Studio styling & animations
│   └── admin.css         # Staff dashboard layout & styles
├── js/
│   ├── app.js            # Storefront logic, filters, modal, WhatsApp generator
│   ├── admin.js          # Staff auth, CRUD catalog, GitHub API sync
│   └── data.js           # Initial catalog fallback and store configuration
└── data/
    └── products.json     # Live product catalog committed to GitHub
```

---

## 🚀 How to Push to Your GitHub Repository (`saboorhussain128-rgb`)

### Option 1: Using Git in your Terminal (PowerShell / Git Bash)

1. Open your terminal in this directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dream Moon by Heena yarn store & staff portal"
   git branch -M main
   ```

2. Create a new repository on GitHub named `dreammoon-store` under your account `saboorhussain128-rgb`.

3. Add your remote and push:
   ```bash
   git remote add origin https://github.com/saboorhussain128-rgb/dreammoon-store.git
   git push -u origin main
   ```
   *(When prompted for password, enter your **GitHub Personal Access Token (PAT)** with `repo` scope).*

---

### Option 2: Enabling GitHub Pages (Instant Free Hosting)

Once pushed to GitHub:
1. Go to your repository on GitHub: `https://github.com/saboorhussain128-rgb/dreammoon-store`
2. Click **Settings** $\rightarrow$ **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Your live website URL will be:  
   👉 `https://saboorhussain128-rgb.github.io/dreammoon-store/`

---

## 🔐 How the Staff / Admin Portal Works

1. Visit `admin.html` (or click the **Staff Access** lock icon on the website).
2. Enter the staff passcode: **`dreammoon2026`** *(can be changed inside the portal)*.
3. In the portal, you can:
   - Click **Add Yarn Creation** to add new items with custom yarn colorways, prices, and photos.
   - Edit any existing item or toggle **In Stock** vs **Made to Order**.
   - Check customer inquiries in the **Customer Inquiries** tab.
   - Click **Publish to Live Site** $\rightarrow$ enter your GitHub Token once $\rightarrow$ click **Commit & Publish Live**. The site commits directly to GitHub and updates live in 1–2 minutes!

---

## 📞 Contact & Order Configuration

To update the default WhatsApp receiving phone number:
- Open `js/data.js` and edit `whatsappNumber: "+919876543210"` to Heena's active WhatsApp phone number.
