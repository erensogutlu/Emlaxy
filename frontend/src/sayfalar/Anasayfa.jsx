import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IlanKarti from '../bilesenler/IlanKarti';
import { Search, Save, X } from 'lucide-react';
import { useKullanici } from '../baglam/kullanici_baglami';
import { toast } from 'react-hot-toast';

const Anasayfa = () => {
  const { kullanici, token } = useKullanici();
  const konumLink = useLocation();
  const yonlendir = useNavigate();

  const [ilanlar, setIlanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreler, setFiltreler] = useState({
    islem_tipi: '',
    konum: '',
    min_fiyat: '',
    max_fiyat: ''
  });

  const ilanlariGetir = async () => {
    setYukleniyor(true);
    try {
      const sorguParametreleri = new URLSearchParams(
        Object.entries(filtreler).filter(([_, v]) => v !== '')
      ).toString();
      
      const yanit = await fetch(`http://127.0.0.1:5000/api/ilanlar?${sorguParametreleri}`);
      const veri = await yanit.json();
      setIlanlar(veri);
    } catch (hata) {
      console.error('ilanlar getirilirken hata:', hata);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    // Check URL parameters for saved searches
    const queryParams = new URLSearchParams(konumLink.search);
    const baslangicFiltre = {
      islem_tipi: queryParams.get('islem_tipi') || '',
      konum: queryParams.get('konum') || '',
      min_fiyat: queryParams.get('min_fiyat') || '',
      max_fiyat: queryParams.get('max_fiyat') || ''
    };
    setFiltreler(baslangicFiltre);

    const filtrelenmisSorgu = new URLSearchParams(
      Object.entries(baslangicFiltre).filter(([_, v]) => v !== '')
    ).toString();

    setYukleniyor(true);
    fetch(`http://127.0.0.1:5000/api/ilanlar?${filtrelenmisSorgu}`)
      .then(res => res.json())
      .then(veri => setIlanlar(veri))
      .catch(err => console.error(err))
      .finally(() => setYukleniyor(false));
  }, [konumLink.search]);

  const aramaKaydet = async () => {
    if (!kullanici) {
      toast.error('Arama kaydetmek için giriş yapmalısınız.');
      return;
    }
    const bosMu = Object.values(filtreler).every(x => x === '');
    if (bosMu) {
      toast.error('Kaydetmek için en az bir filtre girmelisiniz.');
      return;
    }

    const ozelBaslik = prompt('Bu arama için bir başlık girin:', 'Kayıtlı Arama');
    if (!ozelBaslik) return;

    try {
      const yanit = await fetch('http://127.0.0.1:5000/api/aramalar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ baslik: ozelBaslik, filtreler })
      });
      if (yanit.ok) {
        toast.success('Arama başarıyla kaydedildi! Profilimden ulaşabilirsiniz.');
      }
    } catch (hata) {
      console.error('Arama kaydetme sorunu:', hata);
    }
  };

  const filtreDegisti = (e) => {
    setFiltreler({ ...filtreler, [e.target.name]: e.target.value });
  };

  const filtreUygula = (e) => {
    e.preventDefault();
    ilanlariGetir();
  };

  const filtreTemizle = () => {
    setFiltreler({
      islem_tipi: '',
      konum: '',
      min_fiyat: '',
      max_fiyat: ''
    });
    yonlendir('/');
  };

  return (
    <div className="animasyon-asagi">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '3.5rem' }}>Hayalinizdeki Evi Bulun</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: 'var(--metin-ikincil)' }}>
          Gelişmiş filtreleme alanını kullanarak size en uygun satılık veya kiralık mülkü saniyeler içinde keşfedin.
        </p>
      </div>

      <div className="cam-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
          <Search color="var(--ikincil)" /> Detaylı Filtreleme
        </h2>
        <form onSubmit={filtreUygula} className="grid-izgarasi" style={{ gap: '1.5rem' }}>
          <div className="form-grubu">
            <label>İşlem Tipi</label>
            <select name="islem_tipi" className="form-kontrol" value={filtreler.islem_tipi} onChange={filtreDegisti}>
              <option value="">Tümü</option>
              <option value="satilik">Satılık</option>
              <option value="kiralik">Kiralık</option>
            </select>
          </div>
          <div className="form-grubu">
            <label>Konum</label>
            <input type="text" name="konum" className="form-kontrol" placeholder="Örn: İstanbul, Kadıköy" value={filtreler.konum} onChange={filtreDegisti} />
          </div>
          <div className="form-grubu">
            <label>Min Fiyat (₺)</label>
            <input type="number" name="min_fiyat" className="form-kontrol" placeholder="Limitsiz" value={filtreler.min_fiyat} onChange={filtreDegisti} />
          </div>
          <div className="form-grubu">
            <label>Max Fiyat (₺)</label>
            <input type="number" name="max_fiyat" className="form-kontrol" placeholder="Limitsiz" value={filtreler.max_fiyat} onChange={filtreDegisti} />
          </div>
          <div className="form-grubu" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ikincil" onClick={filtreTemizle} style={{ height: '52px', padding: '0 1rem' }} title="Filtreleri Temizle">
              <X size={18} />
            </button>
            <button type="submit" className="btn btn-birincil" style={{ flexGrow: 1, height: '52px' }}>
              <Search size={18} /> Sonuç Göster
            </button>
            {kullanici && (
              <button type="button" className="btn btn-ikincil" onClick={aramaKaydet} style={{ height: '52px', padding: '0 1rem' }} title="Bu aramayı kaydet">
                <Save size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {yukleniyor ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--birincil)' }}>Yükleniyor...</div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--panel-kenarlik)' }}>
            <h3 style={{ margin: 0 }}>En Güncel İlanlar</h3>
            <span style={{ color: 'var(--metin-ikincil)' }}>Toplam {ilanlar.length} ilan listeletiliyor.</span>
          </div>
          <div className="grid-izgarasi">
            {ilanlar.map((ilan, index) => (
              <IlanKarti key={ilan.id} ilan={ilan} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Anasayfa;
