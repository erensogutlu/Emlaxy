const db = require('../config/veritabani');

const mesajGonder = async (req, res) => {
  try {
    const { ilan_id, alici_id, icerik } = req.body;
    const gonderen_id = req.kullanici.id;

    if (!ilan_id || !alici_id || !icerik) {
      return res.status(400).json({ hata: 'Gerekli bilgiler eksik.' });
    }

    if (icerik.length > 2000) {
      return res.status(400).json({ hata: 'Mesaj çok uzun (Maksimum 2000 karakter).' });
    }

    // Engel kontrolü
    const engelKontrol = await db.sorgu(
      'SELECT id FROM engellenen_kullanicilar WHERE engelleyen_id = $1 AND engellenen_id = $2',
      [alici_id, gonderen_id]
    );

    if (engelKontrol.rows.length > 0) {
      return res.status(403).json({ hata: 'Bu kullanıcıya mesaj gönderemezsiniz.' });
    }

    const yeniMesaj = await db.sorgu(
      'INSERT INTO mesajlar (gonderen_id, alici_id, ilan_id, icerik) VALUES ($1, $2, $3, $4) RETURNING *',
      [gonderen_id, alici_id, ilan_id, icerik]
    );

    res.status(201).json(yeniMesaj.rows[0]);
  } catch (hata) {
    console.error('Mesaj gönderme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
  }
};

const sohbetleriGetir = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;

    const sorguText = `
      SELECT 
        m.ilan_id, 
        i.baslik as ilan_baslik, 
        i.resim_url,
        CASE WHEN m.gonderen_id = $1 THEN m.alici_id ELSE m.gonderen_id END AS karsi_id,
        k.ad_soyad AS karsi_ad_soyad,
        MAX(m.tarih) AS son_mesaj_tarihi
      FROM mesajlar m
      JOIN ilanlar i ON m.ilan_id = i.id
      JOIN kullanicilar k ON k.id = (CASE WHEN m.gonderen_id = $1 THEN m.alici_id ELSE m.gonderen_id END)
      WHERE m.gonderen_id = $1 OR m.alici_id = $1
      GROUP BY m.ilan_id, i.baslik, i.resim_url, karsi_id, k.ad_soyad
      ORDER BY son_mesaj_tarihi DESC
    `;

    const sohbetler = await db.sorgu(sorguText, [kullanici_id]);
    res.status(200).json(sohbetler.rows);
  } catch (hata) {
    console.error('Sohbetleri getirme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const mesajlariGetir = async (req, res) => {
  try {
    const gonderen_id = req.kullanici.id;
    const { karsi_id, ilan_id } = req.params;

    const sorguText = `
      SELECT m.*, k.ad_soyad as gonderen_ad_soyad
      FROM mesajlar m
      JOIN kullanicilar k ON m.gonderen_id = k.id
      WHERE m.ilan_id = $1 
        AND ((m.gonderen_id = $2 AND m.alici_id = $3) OR (m.gonderen_id = $3 AND m.alici_id = $2))
      ORDER BY m.tarih ASC
    `;

    const mesajlar = await db.sorgu(sorguText, [ilan_id, gonderen_id, karsi_id]);
    res.status(200).json(mesajlar.rows);
  } catch (hata) {
    console.error('Mesajları getirme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const mesajSil = async (req, res) => {
  try {
    const { id } = req.params;
    const kullanici_id = req.kullanici.id;

    const sonuc = await db.sorgu(
      'DELETE FROM mesajlar WHERE id = $1 AND gonderen_id = $2 RETURNING *',
      [id, kullanici_id]
    );

    if (sonuc.rows.length === 0) {
      return res.status(404).json({ hata: 'Mesaj bulunamadı veya silme yetkiniz yok.' });
    }

    res.status(200).json({ mesaj: 'Mesaj başarıyla silindi.' });
  } catch (hata) {
    console.error('Mesaj silme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const sohbetSil = async (req, res) => {
  try {
    const { karsi_id, ilan_id } = req.params;
    const kullanici_id = req.kullanici.id;

    await db.sorgu(
      `DELETE FROM mesajlar 
       WHERE ilan_id = $1 
       AND ((gonderen_id = $2 AND alici_id = $3) OR (gonderen_id = $3 AND alici_id = $2))`,
      [ilan_id, kullanici_id, karsi_id]
    );

    res.status(200).json({ mesaj: 'Sohbet başarıyla silindi.' });
  } catch (hata) {
    console.error('Sohbet silme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

module.exports = {
  mesajGonder,
  sohbetleriGetir,
  mesajlariGetir,
  mesajSil,
  sohbetSil
};
