const db = require('./config/veritabani');
const bcrypt = require('bcrypt');

const adminOlustur = async () => {
  try {
    const eposta = 'admin@emlaxy.com';
    const sifre = 'EmlaxyAdmin123!';
    const ad_soyad = 'Emlaxy Yönetici';
    const rol = 'admin';

    // Kullanıcı zaten var mı?
    const kontrol = await db.sorgu('SELECT * FROM kullanicilar WHERE eposta = $1', [eposta]);
    
    if (kontrol.rows.length > 0) {
      console.log('Admin kullanıcısı zaten mevcut, rolü admin olarak güncelleniyor...');
      await db.sorgu('UPDATE kullanicilar SET rol = $1 WHERE eposta = $2', [rol, eposta]);
      console.log('Admin rolü başarıyla güncellendi.');
    } else {
      console.log('Admin kullanıcısı oluşturuluyor...');
      const tuz = await bcrypt.genSalt(10);
      const sifre_hash = await bcrypt.hash(sifre, tuz);
      
      await db.sorgu(
        'INSERT INTO kullanicilar (ad_soyad, eposta, sifre_hash, rol) VALUES ($1, $2, $3, $4)',
        [ad_soyad, eposta, sifre_hash, rol]
      );
      console.log('Admin kullanıcısı başarıyla oluşturuldu.');
    }
    
    process.exit(0);
  } catch (hata) {
    console.error('Admin oluşturma hatası:', hata);
    process.exit(1);
  }
};

adminOlustur();
