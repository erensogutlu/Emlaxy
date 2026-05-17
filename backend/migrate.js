const { havuz } = require('./config/veritabani');

const tabloOlusturSorgulari = `
CREATE TABLE IF NOT EXISTS kullanicilar (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(100) NOT NULL,
  eposta VARCHAR(100) UNIQUE NOT NULL,
  sifre_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'kullanici',
  kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ilanlar (
  id SERIAL PRIMARY KEY,
  baslik VARCHAR(255) NOT NULL,
  aciklama TEXT,
  fiyat NUMERIC(15,2) NOT NULL,
  oda_sayisi VARCHAR(50),
  metrekare INTEGER,
  konum VARCHAR(255),
  islem_tipi VARCHAR(50) DEFAULT 'satilik',
  resim_url TEXT,
  olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ekleyen_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mesajlar (
  id SERIAL PRIMARY KEY,
  gonderen_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  alici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  ilan_id INTEGER REFERENCES ilanlar(id) ON DELETE CASCADE,
  icerik TEXT NOT NULL,
  tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favoriler (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  ilan_id INTEGER REFERENCES ilanlar(id) ON DELETE CASCADE,
  eklenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(kullanici_id, ilan_id)
);

CREATE TABLE IF NOT EXISTS yorumlar (
  id SERIAL PRIMARY KEY,
  ilan_id INTEGER REFERENCES ilanlar(id) ON DELETE CASCADE,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  icerik TEXT NOT NULL,
  yanit_id INTEGER REFERENCES yorumlar(id) ON DELETE CASCADE,
  olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kayitli_aramalar (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  baslik VARCHAR(255) NOT NULL,
  filtreler_json TEXT NOT NULL,
  olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS engellenen_kullanicilar (
  id SERIAL PRIMARY KEY,
  engelleyen_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  engellenen_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(engelleyen_id, engellenen_id)
);

ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS bina_yasi VARCHAR(50);
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS isitma VARCHAR(50);
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS banyo_sayisi INTEGER;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS balkon BOOLEAN;
ALTER TABLE ilanlar ADD COLUMN IF NOT EXISTS esyalimi BOOLEAN;
`;

const veritabaniniHazirla = async () => {
  try {
    console.log('tablolar oluşturuluyor...');
    await havuz.query(tabloOlusturSorgulari);
    console.log('tablolar başarıyla oluşturuldu.');
    process.exit(0);
  } catch (hata) {
    console.error('tablo oluşturma hatası:', hata);
    process.exit(1);
  }
};

veritabaniniHazirla();
