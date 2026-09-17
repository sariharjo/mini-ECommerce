const jwt = require('jsonwebtoken');
const config = require('../config');

/** Wajib login */
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login.' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
}

/** Wajib role admin */
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak, khusus admin.' });
  }
  next();
}

module.exports = { auth, adminOnly };
