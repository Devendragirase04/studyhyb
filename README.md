# STUDYHUB — Setup Guide

## 🚀 Quick Start

Open `index.html` in your browser to preview the site locally.

---

## 🔧 Step-by-Step Setup (Free)

### Step 1 — Firebase Setup
1. Go to https://console.firebase.google.com
2. Create a new project (e.g., `studyhub-app`)
3. Enable **Firestore Database** (Start in test mode)
4. Enable **Authentication** → Sign-in methods → Enable **Google**
5. Go to Project Settings → Your Apps → Add Web App → Copy the config
6. Paste the config into `js/firebase-config.js`

### Step 2 — Cloudinary Setup (PDF Storage)
1. Go to https://cloudinary.com → Sign up free
2. In your dashboard, copy your **Cloud Name**
3. Go to Settings → Upload → Add upload preset → Set to **Unsigned** → Save
4. Copy the **Upload Preset name**
5. Open `js/admin.js` and set:
   ```js
   const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
   const CLOUDINARY_UPLOAD_PRESET = 'your_preset_name';
   ```

### Step 3 — WhatsApp Group Link
1. Open your WhatsApp group → Group Info → Invite via link → Copy link
2. Open `connect.html` and replace `YOUR_GROUP_INVITE_LINK` with the copied link:
   ```html
   href="https://chat.whatsapp.com/YOUR_ACTUAL_LINK_HERE"
   ```

### Step 4 — Deploy on Netlify (Free)
1. Push this folder to a GitHub repository
2. Go to https://netlify.com → New Site from Git
3. Select your repository → Deploy
4. Your site goes live at: `yourname.netlify.app`

---

## 📁 File Structure
```
website_of_pdfs/
├── index.html          ← Home page
├── library.html        ← PDF Library (free + paid)
├── services.html       ← Services & pricing
├── connect.html        ← WhatsApp group page
├── admin.html          ← Admin panel (upload/manage PDFs)
├── _redirects          ← Netlify routing
├── css/
│   ├── style.css       ← Global styles
│   ├── library.css     ← Library styles
│   ├── services.css    ← Services styles
│   ├── connect.css     ← Connect page styles
│   └── admin.css       ← Admin panel styles
└── js/
    ├── app.js           ← Global JS (navbar, animations)
    ├── firebase-config.js ← Firebase setup (fill your config)
    ├── library.js       ← PDF grid, search, payment modal
    └── admin.js         ← Upload + manage PDFs
```

---

## 💰 Services & Pricing
| Service | Price |
|---|---|
| Student Projects | ₹9,000 – ₹18,000 |
| LaTeX Project Reports | ₹400 – ₹1,000 |
| Research Papers | ₹200 – ₹500 |
| Final Blackbook Report | ₹800 – ₹1,000 |

---

## 🔒 Admin Panel
- Visit `/admin.html` on your live site
- Sign in with your Google account
- Upload PDFs → stored on Cloudinary, metadata saved to Firestore
- Toggle FREE / PAID per PDF with custom price
