const app = require('./app');
const pool = require('./db');
const config = require('./config');

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ Terhubung ke MySQL: ${config.db.host}/${config.db.database}`);
  } catch (err) {
    console.error('❌ Gagal konek MySQL:', err.message);
    console.error('   Pastikan MySQL jalan dan file .env sudah benar.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`🚀 API berjalan di http://localhost:${config.port}/api`);
  });
})();
