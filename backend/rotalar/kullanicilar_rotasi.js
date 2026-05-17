const express = require('express');
const yonlendirici = express.Router();
const { girisKayitSinirlayici } = require('../araYazilimlar/guvenlik');
const kullaniciKontrolcusu = require('../kontrolculer/kullanici_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');

// kullanıcı kaydı ve girişi
yonlendirici.post('/kayit', girisKayitSinirlayici, kullaniciKontrolcusu.kayitOl);
yonlendirici.post('/giris', girisKayitSinirlayici, kullaniciKontrolcusu.girisYap);

// korunan rotalar
yonlendirici.get('/profil', yetkilendir, kullaniciKontrolcusu.profilGetir);
yonlendirici.post('/favori/:id', yetkilendir, kullaniciKontrolcusu.favoriIslemi);
yonlendirici.post('/engelle', yetkilendir, kullaniciKontrolcusu.kullaniciEngelle);
yonlendirici.get('/engel-durumu/:karsi_id', yetkilendir, kullaniciKontrolcusu.engelDurumuGetir);

module.exports = yonlendirici;
