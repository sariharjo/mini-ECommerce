# 🛒 Mini E-Commerce

Aplikasi e-commerce sederhana (lite) dengan **Node.js + Express + MySQL** di backend dan **React + Vite** di frontend.
Fitur lengkap: katalog produk, keranjang, checkout, riwayat pesanan, dan panel admin.

---

## ✨ Fitur

**Pembeli (user)**
- Registrasi & login (JWT)
- Lihat katalog produk + pencarian + filter kategori + pagination
- Detail produk
- Keranjang belanja (tersimpan di browser)
- Checkout (stok otomatis berkurang, transaksi DB aman)
- Riwayat & detail pesanan

**Admin**
- Kelola produk (tambah, edit, hapus)
- Kelola semua pesanan (ubah status: pending → paid → shipped → done / cancelled)

---

## 🧩 Tech Stack

| Layer     | Teknologi                                            |
| --------- | ---------------------------------------------------- |
| Backend   | Node.js, Express 4, mysql2, JWT, bcryptjs            |
| Database  | MySQL 8 (InnoDB)                                     |
| Frontend  | React 18, Vite 5, React Router 6, Axios              |
| Auth      | JSON Web Token (Bearer token)                        |

---

## 📁 Struktur Folder

```
mini-ECommerce/
├── README.md
├── requirements.txt
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── .env.example          # contoh konfigurasi, copy jadi .env
│   ├── sql/
│   │   └── schema.sql        # skema database
│   └── src/
│       ├── server.js         # entry point
│       ├── app.js            # setup express + routes
│       ├── config.js         # baca .env
│       ├── db.js             # connection pool MySQL
│       ├── initDb.js         # script buat db & tabel
│       ├── seed.js           # script data awal
│       ├── middleware/
│       │   └── auth.js       # verifikasi JWT + guard admin
│       └── routes/
│           ├── auth.routes.js
│           ├── product.routes.js
│           └── order.routes.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js        # proxy /api → localhost:5000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           # routing
        ├── api.js            # axios instance + helper rupiah()
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Home.jsx
            ├── ProductDetail.jsx
            ├── Cart.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Orders.jsx
            ├── AdminProducts.jsx
            └── AdminOrders.jsx
```

---

## ✅ Prasyarat

Lihat `requirements.txt` untuk detail. Yang wajib:

- **Node.js ≥ 18** (disarankan 20 LTS) & **npm**
- **MySQL Server ≥ 8** (atau MariaDB 10.6+) sedang berjalan

Cek versi:

```bash
node -v
npm -v
mysql --version
```

---

## 🚀 Cara Menjalankan (Langkah demi Langkah)

### 1. Clone / buka folder proyek

```bash
cd mini-ECommerce
```

### 2. Setup Database

Pastikan service MySQL sudah jalan, lalu pilih **salah satu** cara:

**Cara A — otomatis (disarankan)**

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run db:init           # membuat database + tabel
npm run seed              # mengisi data awal (produk + akun demo)
```

**Cara B — manual via MySQL CLI**

```bash
mysql -u root -p < backend/sql/schema.sql
```

### 3. Konfigurasi `.env`

Edit `backend/.env` sesuai MySQL kamu:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # isi password MySQL kamu
DB_NAME=mini_ecommerce
JWT_SECRET=ganti-dengan-string-acak-panjang
JWT_EXPIRES_IN=7d
```

### 4. Jalankan Backend

```bash
cd backend
npm run dev        # atau: npm start
```

Output yang benar:

```
✅ Terhubung ke MySQL: 127.0.0.1/mini_ecommerce
🚀 API berjalan di http://localhost:5000/api
```

### 5. Jalankan Frontend (terminal baru)

```bash
cd frontend
npm install
npm run dev
```

Buka browser: **http://localhost:5173**

---

## 🔑 Akun Demo

| Role  | Email             | Password   |
| ----- | ----------------- | ---------- |
| Admin | `admin@shop.test` | `admin123` |
| User  | `user@shop.test`  | `user123`  |

> Di halaman login juga tersedia tombol **"Isi admin"** / **"Isi user"** untuk mengisi form otomatis.

---

## 📡 Dokumentasi API

Base URL: `http://localhost:5000/api`
Endpoint yang butuh login harus menyertakan header:
`Authorization: Bearer <token>`

### Auth

| Method | Endpoint         | Akses  | Body / Keterangan                       |
| ------ | ---------------- | ------ | --------------------------------------- |
| POST   | `/auth/register` | Publik | `{ name, email, password }`             |
| POST   | `/auth/login`    | Publik | `{ email, password }` → `{ user, token }` |
| GET    | `/auth/me`       | Login  | Profil user saat ini                    |

### Products

| Method | Endpoint              | Akses  | Keterangan                                                    |
| ------ | --------------------- | ------ | ------------------------------------------------------------- |
| GET    | `/products`           | Publik | Query: `search`, `category`, `page`, `limit`                  |
| GET    | `/products/categories`| Publik | Daftar kategori + jumlah produk                               |
| GET    | `/products/:id`       | Publik | Detail produk                                                 |
| POST   | `/products`           | Admin  | `{ name, description, price, stock, category, image_url }`    |
| PUT    | `/products/:id`       | Admin  | Update sebagian / seluruh field                               |
| DELETE | `/products/:id`       | Admin  | Hapus produk                                                  |

### Orders

| Method | Endpoint                       | Akses      | Keterangan                                                    |
| ------ | ------------------------------ | ---------- | ------------------------------------------------------------- |
| POST   | `/orders`                      | Login      | `{ items: [{ product_id, qty }], address }` → checkout        |
| POST   | `/orders/:id/pay`              | Login      | Simulasi bayar: `pending` → `paid` (hanya milik sendiri)      |
| POST   | `/orders/:id/cancel`           | Login      | Batalkan order `pending` → `cancelled` + stok dikembalikan    |
| GET    | `/orders`                      | Login      | Riwayat pesanan milik user                                    |
| GET    | `/orders/:id`                  | Login/Admin| Detail 1 pesanan (owner atau admin)                           |
| GET    | `/orders/admin/all`            | Admin      | Semua pesanan + data pembeli                                  |
| PUT    | `/orders/admin/:id/status`     | Admin      | `{ status }` → `pending｜paid｜shipped｜done｜cancelled`          |

### Contoh: Checkout dengan cURL

```bash
# 1. Login untuk dapat token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@shop.test\",\"password\":\"user123\"}"

# 2. Buat pesanan
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_DARI_LANGKAH_1>" \
  -d "{\"items\":[{\"product_id\":1,\"qty\":2}],\"address\":\"Jl. Merdeka No.1, Jakarta\"}"
```

---

## 🔄 Alur Status Pesanan

Status **tidak berubah otomatis**, karena proyek ini tidak memakai payment gateway asli.
Ada 3 cara mengubahnya:

### Cara 1 — User menekan tombol (paling cepat)

1. Login sebagai `user@shop.test`
2. Buka menu **Pesanan Saya**
3. Pada order berstatus `pending` tersedia tombol:
   - **💳 Bayar Sekarang** → status jadi `paid` (simulasi pembayaran)
   - **Batalkan** → status jadi `cancelled`, stok produk dikembalikan

### Cara 2 — Admin mengubah manual

1. Login sebagai `admin@shop.test`
2. Buka menu **Kelola Pesanan**
3. Ubah dropdown status pada order yang diinginkan → tersimpan otomatis

### Cara 3 — Lewat API

```bash
curl -X POST http://localhost:5000/api/orders/1/pay \
  -H "Authorization: Bearer <TOKEN_USER>"

curl -X PUT http://localhost:5000/api/orders/admin/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d "{\"status\":\"shipped\"}"
```

### Diagram

```
                 ┌──────────┐
   checkout ───► │ pending  │
                 └────┬─────┘
          user: /pay ─┤─ user: /cancel
                      │              │
                      ▼              ▼
                 ┌────────┐   ┌───────────┐
                 │  paid  │   │ cancelled │
                 └───┬────┘   └───────────┘
                     │ admin set status
                     ▼
                 ┌──────────┐      ┌────────┐
                 │ shipped  │ ───► │  done  │
                 └──────────┘      └────────┘
```

> Ingin pembayaran asli? Ganti isi handler `POST /api/orders/:id/pay` di
> `backend/src/routes/order.routes.js` dengan pemanggilan Midtrans/Xendit,
> lalu ubah status lewat webhook mereka (jangan dari sisi client).

---

## 🗄️ Skema Database

```
users          id, name, email(unique), password(hash), role(user|admin), created_at
products       id, name, description, price, stock, category, image_url, created_at
orders         id, user_id→users, total, status, address, created_at
order_items    id, order_id→orders, product_id→products, name, price, qty
```

Catatan implementasi:
- Password di-hash dengan **bcrypt** (10 rounds).
- Checkout memakai **transaksi + row lock** (`SELECT ... FOR UPDATE`) supaya stok tidak minus saat ada request bersamaan.
- Foreign key `ON DELETE CASCADE` untuk `orders`/`order_items`.

---

## 🔧 Troubleshooting

| Masalah | Solusi |
| ------- | ------ |
| `❌ Gagal konek MySQL: Access denied` | Periksa `DB_USER` & `DB_PASSWORD` di `backend/.env` |
| `❌ ECONNREFUSED 127.0.0.1:3306` | Service MySQL belum jalan. Start: `net start mysql` (Windows) / `sudo service mysql start` (Linux) |
| `Unknown database 'mini_ecommerce'` | Jalankan `npm run db:init` di folder `backend` |
| Frontend error `Network Error` / 404 di `/api/...` | Backend belum jalan di port 5000, atau ubah target proxy di `frontend/vite.config.js` |
| `Port 5000 already in use` | Ganti `PORT` di `backend/.env` **dan** target proxy di `vite.config.js` |
| Login berhasil tapi langsung logout | `JWT_SECRET` berubah setelah token dibuat — login ulang |
| Stok tidak berkurang | Pastikan checkout sukses (lihat tabel `order_items`) |

---

## 🧪 Perintah Berguna

```bash
# Backend
cd backend
npm run dev       # jalankan dengan auto-reload (Node 18.11+)
npm start         # jalankan normal
npm run db:init   # buat database + tabel
npm run seed      # isi data contoh (idempotent)

# Frontend
cd frontend
npm run dev       # dev server (http://localhost:5173)
npm run build     # build production ke folder dist/
npm run preview   # preview hasil build
```

---

## 🛡️ Catatan Keamanan (untuk produksi)

Proyek ini dibuat sederhana untuk pembelajaran. Sebelum dipakai produksi:

- Ganti `JWT_SECRET` dengan nilai acak kuat, simpan di secret manager.
- Tambahkan validasi input (mis. `zod` / `express-validator`).
- Batasi `cors` hanya ke domain frontend (`cors({ origin: 'https://domainmu.com' })`).
- Aktifkan rate limiting (`express-rate-limit`) pada endpoint auth.
- Gunakan HTTPS dan refresh token.

---

## 📄 Lisensi

MIT — bebas dipakai, dimodifikasi, dan dibagikan untuk keperluan belajar.

Langkah push ke Repository
- cd path/ke/folder/mini-ECommerce
- git status
- git init
- git add .
- git commit -m "Initial upload mini-ECommerce"
- git branch -M main
- git remote add origin https://github.com/sariharjo/mini-ECommerce.git (bisa disesuaikan dengan link repo)
- git push -u origin main (jika sudah ada README pakai ini aja: git push origin main)

Kalau repo sudah ada isinya (misal README yang auto-generated saat create repo), jalankan ini dulu sebelum push:
- git pull origin main --allow-unrelated-histories
