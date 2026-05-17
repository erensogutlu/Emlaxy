const jwt = require('jsonwebtoken');

const yetkilendir = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ hata: 'yetkilendirme reddedildi, token bulunamadı.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const dogrulanmis = jwt.verify(token, process.env.JWT_GIZLI_ANAHTAR);
    req.kullanici = dogrulanmis;
    next();
  } catch (hata) {
    res.status(401).json({ hata: 'geçersiz token.' });
  }
};

module.exports = yetkilendir;
