const db = require('../config/veritabani');

const ilanlariGetir = async (req, res) => {
  try {
    const { islem_tipi, konum, min_fiyat, max_fiyat } = req.query;
    let sorguMetni = 'SELECT * FROM ilanlar WHERE 1=1';
    let parametreler = [];
    let sayac = 1;

    if (islem_tipi) {
      sorguMetni += ` AND islem_tipi = $${sayac}`;
      parametreler.push(islem_tipi);
      sayac++;
    }

    if (konum) {
      sorguMetni += ` AND konum ILIKE $${sayac}`;
      parametreler.push(`%${konum}%`);
      sayac++;
    }

    if (min_fiyat) {
      sorguMetni += ` AND fiyat >= $${sayac}`;
      parametreler.push(min_fiyat);
      sayac++;
    }

    if (max_fiyat) {
      sorguMetni += ` AND fiyat <= $${sayac}`;
      parametreler.push(max_fiyat);
      sayac++;
    }

    sorguMetni += ' ORDER BY olusturma_tarihi DESC';

    const sonuc = await db.sorgu(sorguMetni, parametreler);
    res.status(200).json(sonuc.rows);
  } catch (hata) {
    console.error('ilanları getirme hatası:', hata);
    res.status(500).json({ hata: 'ilanlar alınırken sunucu hatası oluştu.' });
  }
};

const ilanDetayGetir = async (req, res) => {
  try {
    const { id } = req.params;
    const sonuc = await db.sorgu(
      `SELECT i.*, k.ad_soyad as ekleyen_ad_soyad, k.eposta as ekleyen_eposta 
       FROM ilanlar i 
       JOIN kullanicilar k ON i.ekleyen_id = k.id 
       WHERE i.id = $1`,
      [id]
    );

    if (sonuc.rows.length === 0) {
      return res.status(404).json({ hata: 'ilan bulunamadı.' });
    }

    res.status(200).json(sonuc.rows[0]);
  } catch (hata) {
    console.error('ilan detay hatası:', hata);
    res.status(500).json({ hata: 'sunucu hatası oluştu.' });
  }
};

const ilanEkle = async (req, res) => {
  try {
    const {
      baslik, aciklama, fiyat, oda_sayisi, metrekare, konum, islem_tipi, resim_url,
      bina_yasi, isitma, banyo_sayisi, balkon, esyalimi
    } = req.body;
    const ekleyen_id = req.kullanici.id;


    // 1. ilan sayısı sınırı (maksimum 50 ilan)
    const ilanSayisiSonuc = await db.sorgu('SELECT COUNT(*) FROM ilanlar WHERE ekleyen_id = $1', [ekleyen_id]);
    if (parseInt(ilanSayisiSonuc.rows[0].count) >= 50) {
      return res.status(403).json({ hata: 'Maksimum ilan limitine ulaştınız (50). Lütfen eski ilanlarınızdan bazılarını silin.' });
    }

    // 2. metin uzunluğu kontrolleri
    if (baslik && baslik.length > 255) {
      return res.status(400).json({ hata: 'Başlık çok uzun (Maksimum 255 karakter).' });
    }
    if (aciklama && aciklama.length > 10000) {
      return res.status(400).json({ hata: 'Açıklama çok uzun (Maksimum 10000 karakter).' });
    }

    const yeniIlan = await db.sorgu(
      `INSERT INTO ilanlar (
        baslik, aciklama, fiyat, oda_sayisi, metrekare, konum, islem_tipi, resim_url, ekleyen_id,
        bina_yasi, isitma, banyo_sayisi, balkon, esyalimi
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        baslik, aciklama, fiyat, oda_sayisi, metrekare, konum, islem_tipi || 'satilik', resim_url, ekleyen_id,
        bina_yasi, isitma, banyo_sayisi, balkon || false, esyalimi || false
      ]
    );

    res.status(201).json(yeniIlan.rows[0]);
  } catch (hata) {
    console.error('ilan ekleme hatası:', hata);
    res.status(500).json({ hata: 'ilan eklenirken sunucu hatası.' });
  }
};

const ilanSil = async (req, res) => {
  try {
    const { id } = req.params;
    const kullanici_id = req.kullanici.id;

    const ilanKontrol = await db.sorgu('SELECT * FROM ilanlar WHERE id = $1', [id]);

    if (ilanKontrol.rows.length === 0) {
      return res.status(404).json({ hata: 'ilan bulunamadı.' });
    }

    if (ilanKontrol.rows[0].ekleyen_id !== kullanici_id && req.kullanici.rol !== 'admin') {
      return res.status(403).json({ hata: 'bu ilanı silme yetkiniz yok.' });
    }

    await db.sorgu('DELETE FROM ilanlar WHERE id = $1', [id]);
    res.status(200).json({ mesaj: 'ilan başarıyla silindi.' });
  } catch (hata) {
    console.error('ilan silme hatası:', hata);
    res.status(500).json({ hata: 'ilan silinirken sunucu hatası.' });
  }
};

const ilanGuncelle = async (req, res) => {
  try {
    const { id } = req.params;
    const kullanici_id = req.kullanici.id;
    const {
      baslik, aciklama, fiyat, oda_sayisi, metrekare, konum, islem_tipi, resim_url,
      bina_yasi, isitma, banyo_sayisi, balkon, esyalimi
    } = req.body;

    const ilanKontrol = await db.sorgu('SELECT * FROM ilanlar WHERE id = $1', [id]);

    if (ilanKontrol.rows.length === 0) {
      return res.status(404).json({ hata: 'ilan bulunamadı.' });
    }

    if (ilanKontrol.rows[0].ekleyen_id !== kullanici_id && req.kullanici.rol !== 'admin') {
      return res.status(403).json({ hata: 'bu ilanı düzenleme yetkiniz yok.' });
    }

    const guncellenenIlan = await db.sorgu(
      `UPDATE ilanlar SET 
        baslik = $1, aciklama = $2, fiyat = $3, oda_sayisi = $4, metrekare = $5, konum = $6, 
        islem_tipi = $7, resim_url = $8, bina_yasi = $9, isitma = $10, banyo_sayisi = $11, 
        balkon = $12, esyalimi = $13
       WHERE id = $14 RETURNING *`,
      [
        baslik, aciklama, fiyat, oda_sayisi, metrekare, konum, islem_tipi, resim_url,
        bina_yasi, isitma, banyo_sayisi, balkon, esyalimi, id
      ]
    );

    res.status(200).json(guncellenenIlan.rows[0]);
  } catch (hata) {
    console.error('ilan guncelleme hatası:', hata);
    res.status(500).json({ hata: 'ilan güncellenirken sunucu hatası.' });
  }
};

module.exports = {
  ilanlariGetir,
  ilanDetayGetir,
  ilanEkle,
  ilanSil,
  ilanGuncelle
};
