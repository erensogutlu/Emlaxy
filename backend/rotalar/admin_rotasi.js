const express = require('express');
const yonlendirici = express.Router();
const adminKontrolcusu = require('../kontrolculer/admin_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');
const adminKontrolu = require('../araYazilimlar/admin_kontrolu');

// Tüm admin rotaları için önce genel yetki sonra admin kontrolü uygulanır
yonlendirici.use(yetkilendir);
yonlendirici.use(adminKontrolu);

yonlendirici.get('/istatistikler', adminKontrolcusu.istatistikleriGetir);
yonlendirici.get('/kullanicilar', adminKontrolcusu.kullanicilariGetir);
yonlendirici.get('/ilanlar', adminKontrolcusu.ilanlariGetir);
yonlendirici.get('/mesajlar', adminKontrolcusu.mesajlariGetir);

yonlendirici.delete('/kullanici/:id', adminKontrolcusu.kullaniciSil);
yonlendirici.delete('/ilan/:id', adminKontrolcusu.ilanSil);

module.exports = yonlendirici;
