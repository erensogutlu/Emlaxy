const adminKontrolu = (req, res, next) => {
  if (!req.kullanici) {
    return res.status(401).json({ hata: 'Yetkisiz erişim.' });
  }

  if (req.kullanici.rol !== 'admin') {
    return res.status(403).json({ hata: 'Bu işlem için yönetici yetkisi gerekiyor.' });
  }

  next();
};

module.exports = adminKontrolu;
