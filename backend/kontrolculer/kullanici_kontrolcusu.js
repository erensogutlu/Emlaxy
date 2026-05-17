const db = require('../config/veritabani');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const kayitOl = async (req, res) => {
  try {
    const { ad_soyad, eposta, sifre, rol } = req.body;

    const hesapRolu = (rol === 'emlakci') ? 'emlakci' : 'bireysel';

    if (!ad_soyad || ad_soyad.length > 100) {
      return res.status(400).json({ hata: 'Ad Soyad geçersiz (Maksimum 100 karakter).' });
    }
    if (!eposta || eposta.length > 100 || !eposta.includes('@')) {
      return res.status(400).json({ hata: 'E-posta geçersiz (Maksimum 100 karakter).' });
    }
    if (!sifre || sifre.length < 6 || sifre.length > 100) {
      return res.status(400).json({ hata: 'Şifre geçersiz (Minimum 6, maksimum 100 karakter).' });
    }

    // kullanıcı var mı kontrolü
    const varolanKullanici = await db.sorgu('SELECT * FROM kullanicilar WHERE eposta = $1', [eposta]);
    if (varolanKullanici.rows.length > 0) {
      return res.status(400).json({ hata: 'bu eposta adresi kullanımdadır.' });
    }

    // şifreleme
    const tuz = await bcrypt.genSalt(10);
    const sifre_hash = await bcrypt.hash(sifre, tuz);

    // veritabanına ekleme
    const yeniKullanici = await db.sorgu(
      'INSERT INTO kullanicilar (ad_soyad, eposta, sifre_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, ad_soyad, eposta, rol',
      [ad_soyad, eposta, sifre_hash, hesapRolu]
    );

    const token = jwt.sign(
      { id: yeniKullanici.rows[0].id, rol: yeniKullanici.rows[0].rol },
      process.env.JWT_GIZLI_ANAHTAR,
      { expiresIn: '1d' }
    );

    res.status(201).json({ kullanici: yeniKullanici.rows[0], token });
  } catch (hata) {
    console.error('kayıt hatası:', hata);
    res.status(500).json({ hata: 'sunucu hatası oluştu.' });
  }
};

const girisYap = async (req, res) => {
  try {
    const { eposta, sifre } = req.body;

    const sonuc = await db.sorgu('SELECT * FROM kullanicilar WHERE eposta = $1', [eposta]);
    if (sonuc.rows.length === 0) {
      return res.status(400).json({ hata: 'geçersiz eposta veya şifre.' });
    }

    const kullanici = sonuc.rows[0];
    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);

    if (!sifreDogruMu) {
      return res.status(400).json({ hata: 'geçersiz eposta veya şifre.' });
    }

    const token = jwt.sign(
      { id: kullanici.id, rol: kullanici.rol },
      process.env.JWT_GIZLI_ANAHTAR,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      kullanici: {
        id: kullanici.id,
        ad_soyad: kullanici.ad_soyad,
        eposta: kullanici.eposta,
        rol: kullanici.rol
      },
      token
    });
  } catch (hata) {
    console.error('giriş hatası:', hata);
    res.status(500).json({ hata: 'sunucu hatası oluştu.' });
  }
};

const profilGetir = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;

    // kullanıcı bilgisi
    const kullaniciSonuc = await db.sorgu('SELECT id, ad_soyad, eposta, rol, kayit_tarihi FROM kullanicilar WHERE id = $1', [kullanici_id]);
    if (kullaniciSonuc.rows.length === 0) {
      return res.status(404).json({ hata: 'kullanıcı bulunamadı.' });
    }

    // kullanıcının oluşturduğu ilanlar
    const ilanlarSonuc = await db.sorgu('SELECT * FROM ilanlar WHERE ekleyen_id = $1 ORDER BY olusturma_tarihi DESC', [kullanici_id]);

    // kullanıcının favorilediği ilanlar
    const favorilerSonuc = await db.sorgu(`
      SELECT i.* 
      FROM ilanlar i
      JOIN favoriler f ON i.id = f.ilan_id
      WHERE f.kullanici_id = $1
      ORDER BY f.eklenme_tarihi DESC
    `, [kullanici_id]);

    res.status(200).json({
      kullanici: kullaniciSonuc.rows[0],
      benimIlanlarim: ilanlarSonuc.rows,
      favoriIlanlarim: favorilerSonuc.rows
    });
  } catch (hata) {
    console.error('profil getirme hatası:', hata);
    res.status(500).json({ hata: 'profil bilgileri alınırken sunucu hatası oluştu.' });
  }
};

const favoriIslemi = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;
    const { id } = req.params; // ilan id

    // ilan var mı kontrolü
    const ilanKontrol = await db.sorgu('SELECT id FROM ilanlar WHERE id = $1', [id]);
    if (ilanKontrol.rows.length === 0) {
      return res.status(404).json({ hata: 'ilan bulunamadı.' });
    }

    // favoriler tablosunda var mı?
    const favoriKontrol = await db.sorgu('SELECT * FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2', [kullanici_id, id]);

    if (favoriKontrol.rows.length > 0) {
      // varsa sil (favorilerden çıkar)
      await db.sorgu('DELETE FROM favoriler WHERE kullanici_id = $1 AND ilan_id = $2', [kullanici_id, id]);
      return res.status(200).json({ favoriEklendi: false, mesaj: 'ilan favorilerden çıkarıldı.' });
    } else {
      // yoksa ekle (favorilere ekle)
      await db.sorgu('INSERT INTO favoriler (kullanici_id, ilan_id) VALUES ($1, $2)', [kullanici_id, id]);
      return res.status(200).json({ favoriEklendi: true, mesaj: 'ilan favorilere eklendi.' });
    }
  } catch (hata) {
    console.error('favori işlem hatası:', hata);
    res.status(500).json({ hata: 'favori işlemi sırasında sunucu hatası oluştu.' });
  }
};

const kullaniciEngelle = async (req, res) => {
  try {
    const engelleyen_id = req.kullanici.id;
    const { engellenen_id } = req.body;

    if (engelleyen_id === parseInt(engellenen_id)) {
      return res.status(400).json({ hata: 'Kendinizi engelleyemezsiniz.' });
    }

    const kontrol = await db.sorgu(
      'SELECT id FROM engellenen_kullanicilar WHERE engelleyen_id = $1 AND engellenen_id = $2',
      [engelleyen_id, engellenen_id]
    );

    if (kontrol.rows.length > 0) {
      await db.sorgu(
        'DELETE FROM engellenen_kullanicilar WHERE engelleyen_id = $1 AND engellenen_id = $2',
        [engelleyen_id, engellenen_id]
      );
      return res.status(200).json({ engellenen: false, mesaj: 'Engelleme kaldırıldı.' });
    } else {
      await db.sorgu(
        'INSERT INTO engellenen_kullanicilar (engelleyen_id, engellenen_id) VALUES ($1, $2)',
        [engelleyen_id, engellenen_id]
      );
      return res.status(200).json({ engellenen: true, mesaj: 'Kullanıcı engellendi.' });
    }
  } catch (hata) {
    console.error('Engelleme hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

const engelDurumuGetir = async (req, res) => {
  try {
    const kullanici_id = req.kullanici.id;
    const { karsi_id } = req.params;

    // Ben mi onu engelledim?
    const benEngelledim = await db.sorgu(
      'SELECT id FROM engellenen_kullanicilar WHERE engelleyen_id = $1 AND engellenen_id = $2',
      [kullanici_id, karsi_id]
    );

    // O mu beni engelledi?
    const oEngelledi = await db.sorgu(
      'SELECT id FROM engellenen_kullanicilar WHERE engelleyen_id = $1 AND engellenen_id = $2',
      [karsi_id, kullanici_id]
    );

    res.status(200).json({
      benEngelledim: benEngelledim.rows.length > 0,
      oEngelledi: oEngelledi.rows.length > 0
    });
  } catch (hata) {
    console.error('Engel durumu hatası:', hata);
    res.status(500).json({ hata: 'Sunucu hatası.' });
  }
};

module.exports = {
  kayitOl,
  girisYap,
  profilGetir,
  favoriIslemi,
  kullaniciEngelle,
  engelDurumuGetir
};
