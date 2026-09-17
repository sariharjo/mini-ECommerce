const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const { auth } = require('../middleware/auth');

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** POST /api/auth/register */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'user']
    );

    const user = { id: result.insertId, name, email, role: 'user' };
    res.status(201).json({ user, token: sign(user) });
  } catch (err) {
    next(err);
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ user: safe, token: sign(safe) });
  } catch (err) {
    next(err);
  }
});

/** GET /api/auth/me */
router.get('/me', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
