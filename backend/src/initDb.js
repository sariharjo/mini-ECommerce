/**
 * Membuat database + tabel dari file sql/schema.sql
 * Jalankan: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  const sqlFile = path.join(__dirname, '..', 'sql', 'schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  console.log('⏳ Menjalankan schema.sql ...');
  await conn.query(sql);
  await conn.end();
  console.log('✅ Database & tabel berhasil dibuat.');
  console.log('👉 Lanjutkan dengan: npm run seed');
})().catch((err) => {
  console.error('❌ Gagal inisialisasi database:', err.message);
  process.exit(1);
});
