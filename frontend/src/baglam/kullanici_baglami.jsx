import React, { createContext, useState, useEffect, useContext } from 'react';

const KullaniciBaglami = createContext();

export const KullaniciSaglayici = ({ children }) => {
  const [kullanici, setKullanici] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [favoriler, setFavoriler] = useState([]);

  const favorileriGetir = async (mevcutToken) => {
    try {
      const yanit = await fetch('http://127.0.0.1:5000/api/kullanicilar/profil', {
        headers: { 'Authorization': `Bearer ${mevcutToken}` }
      });
      if (yanit.ok) {
        const veri = await yanit.json();
        // Sadece ilan ID'lerini diziye al
        setFavoriler(veri.favoriIlanlarim.map(ilan => ilan.id));
      }
    } catch (hata) {
      console.error('Favoriler yüklenemedi:', hata);
    }
  };

  useEffect(() => {
    // başlangıçta token varsa kullanıcı bilgisini ls'den alabiliriz
    const kayitliKullanici = localStorage.getItem('kullanici');
    if (token && kayitliKullanici) {
      setKullanici(JSON.parse(kayitliKullanici));
      favorileriGetir(token);
    }
    setYukleniyor(false);
  }, [token]);

  const giris = (hedefKullanici, hedefToken) => {
    setKullanici(hedefKullanici);
    setToken(hedefToken);
    localStorage.setItem('token', hedefToken);
    localStorage.setItem('kullanici', JSON.stringify(hedefKullanici));
  };

  const favoriIslemiYap = async (ilanId) => {
    if (!token) return false;
    
    // optimistik ui güncellemesi
    const oncekiFavoriler = [...favoriler];
    const eklenecekMi = !favoriler.includes(ilanId);
    
    if (eklenecekMi) {
      setFavoriler([...favoriler, ilanId]);
    } else {
      setFavoriler(favoriler.filter(id => id !== ilanId));
    }

    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/kullanicilar/favori/${ilanId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata);
      
      return veri.favoriEklendi;
    } catch (hata) {
      console.error('Favori işlem hatası:', hata);
      // hata olursa geri al
      setFavoriler(oncekiFavoriler);
      return false;
    }
  };

  const cikis = () => {
    setKullanici(null);
    setToken(null);
    setFavoriler([]);
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
  };

  return (
    <KullaniciBaglami.Provider value={{ kullanici, token, yukleniyor, favoriler, giris, cikis, favoriIslemiYap, favorileriGetir }}>
      {children}
    </KullaniciBaglami.Provider>
  );
};

export const useKullanici = () => useContext(KullaniciBaglami);
