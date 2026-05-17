const express = require('express');
const yonlendirici = express.Router();
const aramaKontrolcusu = require('../kontrolculer/arama_kontrolcusu');
const yetkilendir = require('../araYazilimlar/yetki_kontrolu');

// Tüm rotalar yetki gerektirir
yonlendirici.post('/', yetkilendir, aramaKontrolcusu.aramaKaydet);
yonlendirici.get('/', yetkilendir, aramaKontrolcusu.aramalariGetir);
yonlendirici.delete('/:id', yetkilendir, aramaKontrolcusu.aramaSil);

module.exports = yonlendirici;
