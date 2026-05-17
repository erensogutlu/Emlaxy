const express = require('express');
const cors = require('cors');
require('dotenv').config();

const kullanicilarRotasi = require('./rotalar/kullanicilar_rotasi');
const ilanlarRotasi = require('./rotalar/ilanlar_rotasi');
const yorumlarRotasi = require('./rotalar/yorumlar_rotasi');
const mesajlarRotasi = require('./rotalar/mesajlar_rotasi');
const aramalarRotasi = require('./rotalar/aramalar_rotasi');
const adminRotasi = require('./rotalar/admin_rotasi');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const uygulama = express();

uygulama.use(helmet());

// global hız sınırlayıcı: 15 dakikada maksimum 100 istek
const globalSinirlayici = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına sınır
  message: { hata: 'Çok fazla istek gönderildi, lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
uygulama.use('/api/', globalSinirlayici);

// ara yazılımlar
uygulama.use(cors());
uygulama.use(express.json({ limit: '10kb' })); // Payload boyutu sınırı
uygulama.use(express.urlencoded({ extended: true, limit: '10kb' }));


// ana rota / health check
uygulama.get('/', (req, res) => {
  res.json({
    durum: "aktif",
    mesaj: "Emlaxy API Sunucusu Aktif ve Çalışıyor",
    versiyon: "1.0.0",
    sahip: "Eren Söğütlü"
  });
});

// rotalar
uygulama.use('/api/kullanicilar', kullanicilarRotasi);
uygulama.use('/api/ilanlar', ilanlarRotasi);
uygulama.use('/api/yorumlar', yorumlarRotasi);
uygulama.use('/api/mesajlar', mesajlarRotasi);
uygulama.use('/api/aramalar', aramalarRotasi);
uygulama.use('/api/admin', adminRotasi);

// sunucuyu başlat
const PORT = process.env.PORT || 5000;
uygulama.listen(PORT, '0.0.0.0', () => {
  console.log(`sunucu ${PORT} portunda çalışıyor.`);
});
