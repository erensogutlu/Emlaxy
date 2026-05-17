const express = require('express');
const yonlendirici = express.Router();
const yorumKontrolcusu = require('../kontrolculer/yorum_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');

const { yorumSinirlayici } = require('../araYazilimlar/guvenlik');

// herkese açık rota 
yonlendirici.get('/:ilan_id', yorumKontrolcusu.yorumlariGetir);

// yetki gerektiren rotalar
yonlendirici.post('/:ilan_id', yetkilendir, yorumSinirlayici, yorumKontrolcusu.yorumEkle);
yonlendirici.post('/yanit/:yorum_id', yetkilendir, yorumSinirlayici, yorumKontrolcusu.yanitEkle);

module.exports = yonlendirici;
