import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const KarsilastirmaBaglami = createContext();

export const KarsilastirmaSaglayici = ({ children }) => {
  const [karsilastirmaListesi, setKarsilastirmaListesi] = useState(() => {
    const kayitli = localStorage.getItem('karsilastirma');
    return kayitli ? JSON.parse(kayitli) : [];
  });

  useEffect(() => {
    localStorage.setItem('karsilastirma', JSON.stringify(karsilastirmaListesi));
  }, [karsilastirmaListesi]);

  const listeEkle = (ilan) => {
    if (karsilastirmaListesi.length >= 3) {
      toast.error('En fazla 3 ilan karşılaştırılabilir!');
      return;
    }
    if (!karsilastirmaListesi.some(i => i.id === ilan.id)) {
      setKarsilastirmaListesi([...karsilastirmaListesi, ilan]);
    }
  };

  const listeCikar = (ilanId) => {
    setKarsilastirmaListesi(karsilastirmaListesi.filter(i => i.id !== ilanId));
  };

  return (
    <KarsilastirmaBaglami.Provider value={{ karsilastirmaListesi, listeEkle, listeCikar }}>
      {children}
    </KarsilastirmaBaglami.Provider>
  );
};

export const useKarsilastirma = () => useContext(KarsilastirmaBaglami);
