const router = require('express').Router();
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

/**
 * POST /api/orders
 * Body: { items: [{ product_id, qty }], address }
 * Membuat order + mengurangi stok dalam 1 transaksi.
 */
router.post('/', auth, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { items = [], address = '' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong.' });
    }

    await conn.beginTransaction();

    let total = 0;
    const detail = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.qty) || 1);
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
        item.product_id,
      ]);
      const product = rows[0];
      if (!product) throw Object.assign(new Error('Produk tidak ditemukan.'), { status: 404 });
      if (product.stock < qty) {
        throw Object.assign(new Error(`Stok "${product.name}" tidak cukup.`), { status: 400 });
      }

      total += product.price * qty;
      detail.push({ product, qty });
    }

    const [orderRes] = await conn.query(
      'INSERT INTO orders (user_id, total, status, address) VALUES (?,?,?,?)',
      [req.user.id, total, 'pending', address]
    );
    const orderId = orderRes.insertId;

    for (const { product, qty } of detail) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)',
        [orderId, product.id, product.name, product.price, qty]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product.id]);
    }

    await conn.commit();
    res.status(201).json({ id: orderId, total, status: 'pending' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

/** GET /api/orders  -> riwayat order milik user login */
router.get('/', auth, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    for (const o of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      o.items = items;
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/** GET /api/orders/admin/all  (admin) */
router.get('/admin/all', auth, adminOnly, async (_req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.id DESC`
    );
    for (const o of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      o.items = items;
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/orders/admin/:id/status  (admin) */
router.put('/admin/:id/status', auth, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['pending', 'paid', 'shipped', 'done', 'cancelled'];
    const { status } = req.body;
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status harus salah satu dari: ${allowed.join(', ')}` });
    }
    const [r] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Order tidak ditemukan.' });
    res.json({ message: 'Status diperbarui.', status });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/:id/pay
 * Simulasi pembayaran: pending -> paid.
 * Ganti isi handler ini dengan webhook payment gateway sungguhan
 * (Midtrans/Xendit) bila ingin pembayaran asli.
 */
router.post('/:id/pay', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    const order = rows[0];
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });
    if (order.user_id !== req.user.id) return res.status(403).json({ message: 'Akses ditolak.' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Order berstatus "${order.status}" tidak bisa dibayar.` });
    }

    await pool.query("UPDATE orders SET status = 'paid' WHERE id = ?", [order.id]);
    res.json({ message: 'Pembayaran berhasil (simulasi).', status: 'paid' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/:id/cancel
 * Batalkan pesanan (hanya saat masih 'pending') + kembalikan stok.
 */
router.post('/:id/cancel', auth, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [req.params.id]);
    const order = rows[0];
    if (!order) throw Object.assign(new Error('Order tidak ditemukan.'), { status: 404 });
    if (order.user_id !== req.user.id) throw Object.assign(new Error('Akses ditolak.'), { status: 403 });
    if (order.status !== 'pending') {
      throw Object.assign(
        new Error(`Order berstatus "${order.status}" tidak bisa dibatalkan.`),
        { status: 400 }
      );
    }

    const [items] = await conn.query(
      'SELECT product_id, qty FROM order_items WHERE order_id = ?',
      [order.id]
    );
    for (const it of items) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.qty, it.product_id]);
    }
    await conn.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);

    await conn.commit();
    res.json({ message: 'Pesanan dibatalkan & stok dikembalikan.', status: 'cancelled' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

/** GET /api/orders/:id  -> detail order (owner / admin) */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    const order = rows[0];
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
