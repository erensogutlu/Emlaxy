const rateLimit = require('express-rate-limit');

// giriş ve kayıt için daha sıkı sınır: 1 saatte 5 deneme
const girisKayitSinirlayici = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5,
  message: { hata: 'Çok fazla deneme yaptınız. Lütfen bir saat sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// arama işlemleri için sınır: 1 dakikada 20 arama
const aramaSinirlayici = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 20,
  message: { hata: 'Çok sık arama yapıyorsunuz. Lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ilan ekleme için sınır: 1 saatte 10 ilan
const ilanEklemeSinirlayici = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  message: { hata: 'Saatlik ilan limitine ulaştınız. Lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// mesaj gönderme için sınır: 1 dakikada 10 mesaj
const mesajSinirlayici = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10,
  message: { hata: 'Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// yorum yapma için sınır: 1 dakikada 5 yorum
const yorumSinirlayici = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 5,
  message: { hata: 'Çok sık yorum yapıyorsunuz. Lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  girisKayitSinirlayici,
  aramaSinirlayici,
  ilanEklemeSinirlayici,
  mesajSinirlayici,
  yorumSinirlayici
};
