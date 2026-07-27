# Plesir Suites Radio — Project Structure

## 📁 Folder Structure

```
plesir-suites/
├── index.html                  ← Halaman utama website
├── assets/
│   ├── css/
│   │   └── style.css           ← Semua styling/tampilan
│   ├── js/
│   │   ├── main.js             ← Semua fungsi JavaScript
│   │   └── data/
│   │       ├── schedule.js     ← Data jadwal siaran
│   │       └── products.js     ← Data produk shop
│   └── images/
│       ├── slides/             ← Gambar slideshow
│       ├── shop/               ← Foto produk shop
│       └── logos/              ← Logo kolaborasi
├── data/
│   ├── schedule.js             ← Backup data jadwal
│   └── products.js             ← Backup data produk
├── shop/                       ← (future) Halaman shop terpisah
└── schedule/                   ← (future) Halaman jadwal terpisah
```

---

## ✏️ Cara Edit Konten

### 🗓️ Update Jadwal Siaran
Edit file `assets/js/data/schedule.js`:
```js
const SCHEDULE = {
  Monday: [
    { time: '14:00', end: '16:00', title: 'Nama Show', desc: 'Deskripsi show.' },
  ],
  // dst...
};
```

### 🛍️ Update Produk Shop
Edit file `assets/js/data/products.js`:
```js
const PRODUCTS = {
  'plesir-tee': {
    name: 'Plesir Suites Tee',
    price: 'Rp 250.000',           // ← Ganti harga di sini
    tag: 'Available',               // ← Ganti status
    desc: 'Deskripsi produk...',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'assets/images/shop/tee-1.jpg',  // ← Tambah foto produk
      'assets/images/shop/tee-2.jpg',
    ],
  },
};
```

### 🖼️ Ganti Foto Slideshow
1. Simpan gambar baru ke folder `assets/images/slides/`
2. Update URL di `index.html` pada bagian `slide-bg`

### 🎨 Ganti Styling
Edit `assets/css/style.css` untuk mengubah warna, font, layout, dll.

---

## 🚀 Cara Deploy

### Gratis (Netlify)
1. Zip seluruh folder `plesir-suites/`
2. Upload ke [netlify.com/drop](https://app.netlify.com/drop)
3. Website langsung online!

### GitHub Pages
1. Push folder ke GitHub repository
2. Aktifkan GitHub Pages di Settings → Pages
3. Website online di `username.github.io/plesir-suites`

---

## 📝 Catatan
- File `index.html` adalah file utama — jangan dihapus
- Semua gambar slideshow sudah ter-embed di HTML (base64) — tidak perlu file gambar terpisah untuk slideshow
- Untuk menambah produk shop baru, cukup edit `products.js`
- Untuk backend lebih advanced (Sanity CMS, Supabase, dll) — hubungi developer
