const router = require('express').Router();
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

/** GET /api/products?search=&category=&page=1&limit=12 */
router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '' } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (search) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products ${clause}`,
      params
    );
    const [items] = await pool.query(
      `SELECT * FROM products ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

/** GET /api/products/categories */
router.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT category, COUNT(*) AS total FROM products GROUP BY category ORDER BY category'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/** GET /api/products/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/** POST /api/products  (admin) */
router.post('/', auth, adminOnly, async (req, res, next) => {
  try {
    const { name, description = '', price = 0, stock = 0, category = 'Umum', image_url = '' } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama produk wajib diisi.' });

    const [r] = await pool.query(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?,?,?,?,?,?)',
      [name, description, price, stock, category, image_url]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/products/:id  (admin) */
router.put('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    const old = rows[0];

    const data = {
      name: req.body.name ?? old.name,
      description: req.body.description ?? old.description,
      price: req.body.price ?? old.price,
      stock: req.body.stock ?? old.stock,
      category: req.body.category ?? old.category,
      image_url: req.body.image_url ?? old.image_url,
    };

    await pool.query(
      'UPDATE products SET name=?, description=?, price=?, stock=?, category=?, image_url=? WHERE id=?',
      [data.name, data.description, data.price, data.stock, data.category, data.image_url, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/products/:id  (admin) */
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json({ message: 'Produk dihapus.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
