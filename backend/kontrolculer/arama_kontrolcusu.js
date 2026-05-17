const db = require('../config/veritabani');

const aramaKaydet = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;
    const { baslik, filtreler } = req.body;

    if (!baslik) {
      return res.status(400).json({ hata: 'Arama başlığı gereklidir.' });
    }

    const yeniKayit = await db.sorgu(
      'INSERT INTO kayitli_aramalar (kullanici_id, baslik, filtreler_json) VALUES ($1, $2, $3) RETURNING *',
      [kullanici_id, baslik, JSON.stringify(filtreler)]
    );

    res.status(201).json(yeniKayit.rows[0]);
  } catch (hata) {
    console.error('Arama kaydetme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
  }
};

const aramalariGetir = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;

    const aramalar = await db.sorgu(
      'SELECT * FROM kayitli_aramalar WHERE kullanici_id = $1 ORDER BY olusturma_tarihi DESC',
      [kullanici_id]
    );

    res.status(200).json(aramalar.rows);
  } catch (hata) {
    console.error('Arama getirme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const aramaSil = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;
    const { id } = req.params;

    const kontrolSorgusu = await db.sorgu('SELECT * FROM kayitli_aramalar WHERE id = $1', [id]);
    if (kontrolSorgusu.rows.length === 0) {
      return res.status(404).json({ hata: 'Arama bulunamadı.' });
    }

    if (kontrolSorgusu.rows[0].kullanici_id !== kullanici_id) {
      return res.status(403).json({ hata: 'Bu aramayı silme yetkiniz yok.' });
    }

    await db.sorgu('DELETE FROM kayitli_aramalar WHERE id = $1', [id]);
    res.status(200).json({ mesaj: 'Kayıtlı arama başarıyla silindi.' });
  } catch (hata) {
    console.error('Arama silme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

module.exports = {
  aramaKaydet,
  aramalariGetir,
  aramaSil
};
