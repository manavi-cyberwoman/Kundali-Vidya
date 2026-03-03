# KundaliVidya 🔮
### Free Vedic Kundli Web App

A full-featured Vedic astrology Kundli application inspired by AstroSage.

---

## 📁 Project Structure

```
KundaliVidya/
├── index.html          ← Main HTML page
├── netlify.toml        ← Netlify config (caching, headers)
├── css/
│   └── style.css       ← All styles (AstroSage-inspired UI)
└── js/
    ├── data.js         ← All Vedic astrology data (rashis, planets, yogas...)
    ├── engine.js       ← Computation engine (planetary positions, dasha)
    ├── chart.js        ← Canvas-based North Indian Kundali chart renderer
    ├── panels.js       ← All 15 panel renderers (daily, dasha, mantras...)
    ├── widgets.js      ← Right sidebar widgets
    └── app.js          ← Main app controller
```

---

## 🚀 Deploy to Netlify (FREE — 3 Minutes)

### Method 1: Drag & Drop (Easiest — No Account Needed)

1. Go to **https://netlify.com**
2. Scroll to the bottom of the page — you'll see a **deploy box**
3. **Drag and drop this entire folder** onto it
4. Wait 10 seconds — your site is live!
5. You'll get a free URL like: `https://amazing-kundali-123.netlify.app`

### Method 2: GitHub + Netlify (Best for Updates)

1. **Create a GitHub account** at https://github.com (free)
2. **Create a new repository** → Upload all these files
3. Go to **https://netlify.com** → Sign up free
4. Click **"Add new site"** → **"Import from Git"**
5. Connect GitHub → Select your repo → Click **Deploy**
6. Your site is live at a free `.netlify.app` URL!
7. Every time you push changes to GitHub, the site auto-updates ✨

### Method 3: Netlify CLI (Developer Way)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from this folder
netlify deploy --prod --dir .
```

---

## 🌐 Custom Domain (Optional — ~$1/year)

1. Buy a `.xyz` or `.in` domain from **Namecheap** (~$1–5/year)
2. In Netlify: Site Settings → Domain Management → Add custom domain
3. Follow the DNS instructions (takes ~10 minutes to propagate)

**Example:** `www.kundali.xyz` or `www.mykundali.in`

---

## ✨ Features

- **15 Complete Panels:** Overview, Chart, Planets, Houses, Dasha, Daily, Weekly, Monthly, Yearly, Life Path, Yogas & Doshas, Panchang, Compatibility, Remedies, Mantras
- **AstroSage-style layout:** 3-column with sticky sidebar navigation
- **North Indian Canvas Chart:** Rendered with planet colors (exalted=green, debilitated=red)
- **Vimshottari Dasha:** Full timeline with Antardasha sub-periods
- **Right Sidebar Widgets:** Today's Panchang, Lucky Numbers, Gemstone, Transits
- **100% Free, No Backend, No Database** — pure JavaScript

---

## 🛠 Local Development

Just open `index.html` in any browser. No server needed.

For live reload during development:
```bash
npx serve .
```

---

*For entertainment and spiritual guidance only.*
