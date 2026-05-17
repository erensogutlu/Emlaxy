const db = require('../config/veritabani');

const istatistikleriGetir = async (req, res) => {
  try {
    const kullaniciSayisi = await db.sorgu('SELECT COUNT(*) FROM kullanicilar');
    const ilanSayisi = await db.sorgu('SELECT COUNT(*) FROM ilanlar');
    const mesajSayisi = await db.sorgu('SELECT COUNT(*) FROM mesajlar');
    
    // son eklenen 5 ilan
    const sonIlanlar = await db.sorgu('SELECT * FROM ilanlar ORDER BY olusturma_tarihi DESC LIMIT 5');

    res.status(200).json({
      kullanicilar: parseInt(kullaniciSayisi.rows[0].count),
      ilanlar: parseInt(ilanSayisi.rows[0].count),
      mesajlar: parseInt(mesajSayisi.rows[0].count),
      sonIlanlar: sonIlanlar.rows
    });
  } catch (hata) {
    console.error('İstatistik getirme hatası:', hata);
    res.status(500).json({ hata: 'İstatistikler alınırken bir hata oluştu.' });
  }
};

const kullanicilariGetir = async (req, res) => {
  try {
    const kullanicilar = await db.sorgu('SELECT id, ad_soyad, eposta, rol, kayit_tarihi FROM kullanicilar ORDER BY kayit_tarihi DESC');
    res.status(200).json(kullanicilar.rows);
  } catch (hata) {
    console.error('Kullanıcı listesi hatası:', hata);
    res.status(500).json({ hata: 'Kullanıcılar getirilirken bir hata oluştu.' });
  }
};

const ilanlariGetir = async (req, res) => {
  try {
    const ilanlar = await db.sorgu(`
      SELECT i.*, k.ad_soyad as ekleyen_ad 
      FROM ilanlar i 
      INNER JOIN kullanicilar k ON i.ekleyen_id = k.id 
      ORDER BY i.olusturma_tarihi DESC
    `);
    res.status(200).json(ilanlar.rows);
  } catch (hata) {
    console.error('İlan listesi hatası:', hata);
    res.status(500).json({ hata: 'İlanlar getirilirken bir hata oluştu.' });
  }
};

const mesajlariGetir = async (req, res) => {
  try {
    const mesajlar = await db.sorgu(`
      SELECT m.*, g.ad_soyad as gonderen_ad, a.ad_soyad as alici_ad, i.baslik as ilan_baslik
      FROM mesajlar m
      INNER JOIN kullanicilar g ON m.gonderen_id = g.id
      INNER JOIN kullanicilar a ON m.alici_id = a.id
      LEFT JOIN ilanlar i ON m.ilan_id = i.id
      ORDER BY m.tarih DESC
    `);
    res.status(200).json(mesajlar.rows);
  } catch (hata) {
    console.error('Mesaj listesi hatası:', hata);
    res.status(500).json({ hata: 'Mesajlar getirilirken bir hata oluştu.' });
  }
};

const kullaniciSil = async (req, res) => {
  try {
    const { id } = req.params;
    
    // admin kendini silemesin
    if (parseInt(id) === req.kullanici.id) {
      return res.status(400).json({ hata: 'Kendi hesabınızı silemezsiniz.' });
    }

    await db.sorgu('DELETE FROM kullanicilar WHERE id = $1', [id]);
    res.status(200).json({ mesaj: 'Kullanıcı başarıyla silindi.' });
  } catch (hata) {
    console.error('Kullanıcı silme hatası:', hata);
    res.status(500).json({ hata: 'Kullanıcı silinirken bir hata oluştu.' });
  }
};

const ilanSil = async (req, res) => {
  try {
    const { id } = req.params;
    await db.sorgu('DELETE FROM ilanlar WHERE id = $1', [id]);
    res.status(200).json({ mesaj: 'İlan başarıyla silindi.' });
  } catch (hata) {
    console.error('İlan silme hatası:', hata);
    res.status(500).json({ hata: 'İlan silinirken bir hata oluştu.' });
  }
};

module.exports = {
  istatistikleriGetir,
  kullanicilariGetir,
  ilanlariGetir,
  mesajlariGetir,
  kullaniciSil,
  ilanSil
};
