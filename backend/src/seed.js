/**
 * Seed data awal: 1 admin, 1 user, dan beberapa produk.
 * Jalankan: npm run seed
 */
const bcrypt = require('bcryptjs');
const pool = require('./db');

const products = [
  ['Kaos Polos Premium', 'Kaos katun combed 30s, nyaman dipakai harian.', 89000, 50, 'Fashion', 'https://picsum.photos/seed/kaos/600/600'],
  ['Sepatu Sneakers', 'Sneakers casual dengan sol karet anti slip.', 349000, 20, 'Fashion', 'https://picsum.photos/seed/sepatu/600/600'],
  ['Tas Ransel Laptop', 'Ransel 20L dengan kompartemen laptop 14 inci.', 215000, 30, 'Aksesoris', 'https://picsum.photos/seed/tas/600/600'],
  ['Headphone Bluetooth', 'Wireless headphone, baterai tahan 20 jam.', 275000, 15, 'Elektronik', 'https://picsum.photos/seed/headphone/600/600'],
  ['Mouse Wireless', 'Mouse nirkabel 2.4GHz, silent click.', 75000, 40, 'Elektronik', 'https://picsum.photos/seed/mouse/600/600'],
  ['Tumbler Stainless', 'Tumbler 500ml tahan panas & dingin.', 65000, 60, 'Rumah Tangga', 'https://picsum.photos/seed/tumbler/600/600'],
  ['Buku Notion Kreatif', 'Buku catatan 200 halaman kertas tebal.', 45000, 100, 'Alat Tulis', 'https://picsum.photos/seed/buku/600/600'],
  ['Keyboard Mekanik 60%', 'Keyboard mekanik compact, switch tactile.', 420000, 12, 'Elektronik', 'https://picsum.photos/seed/keyboard/600/600'],
  ['Lampu Meja LED', 'Lampu belajar LED 3 mode cahaya.', 120000, 25, 'Rumah Tangga', 'https://picsum.photos/seed/lampu/600/600'],
  ['Topi Baseball', 'Topi baseball adjustable unisex.', 55000, 70, 'Fashion', 'https://picsum.photos/seed/topi/600/600'],
];

(async () => {
  try {
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user123', 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?,?,?,'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['Administrator', 'admin@shop.test', adminPass]
    );
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?,?,?,'user')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['Budi Pembeli', 'user@shop.test', userPass]
    );

    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM products');
    if (rows[0].total === 0) {
      await pool.query(
        'INSERT INTO products (name, description, price, stock, category, image_url) VALUES ?',
        [products]
      );
      console.log(`✅ ${products.length} produk ditambahkan.`);
    } else {
      console.log(`ℹ️  Produk sudah ada (${rows[0].total}), seed produk dilewati.`);
    }

    console.log('✅ Seed selesai.');
    console.log('   Admin : admin@shop.test / admin123');
    console.log('   User  : user@shop.test  / user123');
  } catch (err) {
    console.error('❌ Seed gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
