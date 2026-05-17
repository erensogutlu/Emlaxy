const express = require('express');
const yonlendirici = express.Router();
const mesajKontrolcusu = require('../kontrolculer/mesaj_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');

const { mesajSinirlayici } = require('../araYazilimlar/guvenlik');

// tüm rotalar yetki gerektirir
yonlendirici.post('/', yetkilendir, mesajSinirlayici, mesajKontrolcusu.mesajGonder);
yonlendirici.get('/sohbetler', yetkilendir, mesajKontrolcusu.sohbetleriGetir);
yonlendirici.get('/sohbet/:karsi_id/:ilan_id', yetkilendir, mesajKontrolcusu.mesajlariGetir);
yonlendirici.delete('/sohbet/:karsi_id/:ilan_id', yetkilendir, mesajKontrolcusu.sohbetSil);
yonlendirici.delete('/:id', yetkilendir, mesajKontrolcusu.mesajSil);

module.exports = yonlendirici;
