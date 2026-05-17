const db = require('../config/veritabani');

const yorumEkle = async (req, res) => {
  try {
    const { ilan_id } = req.params;
    const { icerik } = req.body;
    const kullanici_id = req.kullanici.id;

    if (!icerik) return res.status(400).json({ hata: 'Yorum içeriği boş olamaz.' });
    if (icerik.length > 1000) return res.status(400).json({ hata: 'Yorum çok uzun (Maksimum 1000 karakter).' });

    // ilan var mı kontrolü
    const ilanKontrol = await db.sorgu('SELECT id FROM ilanlar WHERE id = $1', [ilan_id]);
    if (ilanKontrol.rows.length === 0) {
      return res.status(404).json({ hata: 'İlan bulunamadı.' });
    }

    const yeniYorum = await db.sorgu(
      'INSERT INTO yorumlar (ilan_id, kullanici_id, icerik) VALUES ($1, $2, $3) RETURNING *',
      [ilan_id, kullanici_id, icerik]
    );

    res.status(201).json(yeniYorum.rows[0]);
  } catch (hata) {
    console.error('Yorum ekleme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const yanitEkle = async (req, res) => {
  try {
    const { yorum_id } = req.params;
    const { icerik } = req.body;
    const kullanici_id = req.kullanici.id; // Yanıt veren kişi (muhtemelen ilan sahibi)

    if (!icerik) return res.status(400).json({ hata: 'Yanıt içeriği boş olamaz.' });
    if (icerik.length > 1000) return res.status(400).json({ hata: 'Yanıt çok uzun (Maksimum 1000 karakter).' });

    // Yorumu bul ve ilanın sahibini kontrol et
    const yorumSorgu = await db.sorgu(
      'SELECT y.ilan_id, i.ekleyen_id FROM yorumlar y JOIN ilanlar i ON y.ilan_id = i.id WHERE y.id = $1',
      [yorum_id]
    );

    if (yorumSorgu.rows.length === 0) {
      return res.status(404).json({ hata: 'Yanıtlanacak yorum bulunamadı.' });
    }

    const { ilan_id, ekleyen_id } = yorumSorgu.rows[0];

    // sadece ilanın sahibi ve admin yanıt verebilir
    if (ekleyen_id !== kullanici_id && req.kullanici.rol !== 'admin') {
      return res.status(403).json({ hata: 'Bu yoruma sadece ilan sahibi yanıt verebilir.' });
    }

    // yanıt olarak yeni yorum ekle ama yanit_id ile bağla
    const yeniYanit = await db.sorgu(
      'INSERT INTO yorumlar (ilan_id, kullanici_id, icerik, yanit_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [ilan_id, kullanici_id, icerik, yorum_id]
    );

    res.status(201).json(yeniYanit.rows[0]);
  } catch (hata) {
    console.error('Yanıt ekleme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const yorumlariGetir = async (req, res) => {
  try {
    const { ilan_id } = req.params;

    // Tüm yorumları ve ilgili kullanıcı bilgilerini getir
    const sonuc = await db.sorgu(`
      SELECT y.*, k.ad_soyad, k.rol
      FROM yorumlar y
      JOIN kullanicilar k ON y.kullanici_id = k.id
      WHERE y.ilan_id = $1
      ORDER BY y.olusturma_tarihi ASC
    `, [ilan_id]);

    const tumYorumlar = sonuc.rows;

    const anaYorumlar = tumYorumlar.filter(y => y.yanit_id === null);

    const formatliYorumlar = anaYorumlar.map(anaYorum => {
      const yanitlar = tumYorumlar.filter(y => y.yanit_id === anaYorum.id);
      return { ...anaYorum, yanitlar };
    });

    res.status(200).json(formatliYorumlar);
  } catch (hata) {
    console.error('Yorumları getirme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

module.exports = {
  yorumEkle,
  yanitEkle,
  yorumlariGetir
};
