const { Pool } = require('pg');
require('dotenv').config();

// postgresql veritabanı bağlantı havuzunu oluşturuyoruz
const havuz = new Pool({
  connectionString: process.env.VERITABANI_URL,
});

havuz.on('connect', () => {
  console.log('veritabanına başarıyla bağlanıldı');
});

havuz.on('error', (hata) => {
  console.error('veritabanı bağlantı hatası:', hata);
});

module.exports = {
  sorgu: (metin, parametreler) => havuz.query(metin, parametreler),
  havuz
};
