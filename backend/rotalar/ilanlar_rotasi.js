const express = require('express');
const yonlendirici = express.Router();
const ilanKontrolcusu = require('../kontrolculer/ilan_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');

const { ilanEklemeSinirlayici } = require('../araYazilimlar/guvenlik');

// herkese açık rotalar
yonlendirici.get('/', ilanKontrolcusu.ilanlariGetir);
yonlendirici.get('/:id', ilanKontrolcusu.ilanDetayGetir);

// yetki gerektiren rotalar
yonlendirici.post('/', yetkilendir, ilanEklemeSinirlayici, ilanKontrolcusu.ilanEkle);
yonlendirici.put('/:id', yetkilendir, ilanKontrolcusu.ilanGuncelle);
yonlendirici.delete('/:id', yetkilendir, ilanKontrolcusu.ilanSil);

module.exports = yonlendirici;
