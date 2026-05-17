import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useKullanici } from '../baglam/kullanici_baglami';
import { toast } from 'react-hot-toast';

const IlanDuzenle = () => {
  const { id } = useParams();
  const { kullanici, token } = useKullanici();
  const yonlendir = useNavigate();
  const [ilanBilgileri, setIlanBilgileri] = useState({
    baslik: '',
    aciklama: '',
    fiyat: '',
    oda_sayisi: '',
    metrekare: '',
    konum: '',
    islem_tipi: 'satilik',
    bina_yasi: 'Sıfır',
    isitma: 'Doğalgaz (Kombi)',
    banyo_sayisi: '1',
    balkon: false,
    esyalimi: false,
    resim_url: ''
  });
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const ilanGetir = async () => {
      try {
        const yanit = await fetch(`${API_URL}/api/ilanlar/${id}`);
        if (yanit.ok) {
          const veri = await yanit.json();
          // Eğer giriş yapan kullanıcı ilan sahibi değilse ve admin değilse anasayfaya at
          if (kullanici && (kullanici.id === veri.ekleyen_id || kullanici.rol === 'admin')) {
            setIlanBilgileri({
              baslik: veri.baslik || '',
              aciklama: veri.aciklama || '',
              fiyat: veri.fiyat || '',
              oda_sayisi: veri.oda_sayisi || '',
              metrekare: veri.metrekare || '',
              konum: veri.konum || '',
              islem_tipi: veri.islem_tipi || 'satilik',
              bina_yasi: veri.bina_yasi || 'Sıfır',
              isitma: veri.isitma || 'Doğalgaz (Kombi)',
              banyo_sayisi: veri.banyo_sayisi || '1',
              balkon: veri.balkon || false,
              esyalimi: veri.esyalimi || false,
              resim_url: veri.resim_url || ''
            });
          } else {
            toast.error('Bu ilanı düzenleme yetkiniz yok.');
            yonlendir('/');
          }
        } else {
          yonlendir('/');
        }
      } catch (hata) {
        console.error('İlan detayı alınamadı:', hata);
      } finally {
        setYukleniyor(false);
      }
    };
    if (kullanici) {
      ilanGetir();
    }
  }, [id, yonlendir, kullanici]);

  if (!kullanici) return <Navigate to="/giris" />;
  if (yukleniyor) return <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>;

  const degisimAlici = (e) => {
    const constTipi = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setIlanBilgileri({ ...ilanBilgileri, [e.target.name]: constTipi });
  };

  const formGonder = async (e) => {
    e.preventDefault();
    try {
      const yanit = await fetch(`${API_URL}/api/ilanlar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ilanBilgileri)
      });
      
      if (yanit.ok) {
        yonlendir(`/ilan/${id}`);
      } else {
        toast.error('İlan güncellenirken hata oluştu.');
      }
    } catch (hata) {
      console.error('İlan güncelleme hatası:', hata);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="cam-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>İlanı Düzenle</h2>
        <form onSubmit={formGonder}>
          <div className="form-grubu">
            <label>İlan Başlığı</label>
            <input type="text" name="baslik" className="form-kontrol" required value={ilanBilgileri.baslik} onChange={degisimAlici} />
          </div>
          
          <div className="form-grubu">
            <label>Açıklama</label>
            <textarea name="aciklama" className="form-kontrol" rows="4" value={ilanBilgileri.aciklama} onChange={degisimAlici}></textarea>
          </div>
          
          <div className="grid-izgarasi" style={{ gap: '1rem', marginBottom: '0' }}>
            <div className="form-grubu">
              <label>Fiyat (₺)</label>
              <input type="number" name="fiyat" className="form-kontrol" required value={ilanBilgileri.fiyat} onChange={degisimAlici} />
            </div>
            
            <div className="form-grubu">
              <label>İşlem Tipi</label>
              <select name="islem_tipi" className="form-kontrol" onChange={degisimAlici} value={ilanBilgileri.islem_tipi}>
                <option value="satilik">Satılık</option>
                <option value="kiralik">Kiralık</option>
              </select>
            </div>
          </div>
          
          <div className="grid-izgarasi" style={{ gap: '1rem', marginBottom: '0' }}>
            <div className="form-grubu">
              <label>Oda Sayısı</label>
              <input type="text" name="oda_sayisi" className="form-kontrol" placeholder="Örn: 3+1" value={ilanBilgileri.oda_sayisi} onChange={degisimAlici} />
            </div>
            
            <div className="form-grubu">
              <label>Metrekare</label>
              <input type="number" name="metrekare" className="form-kontrol" value={ilanBilgileri.metrekare} onChange={degisimAlici} />
            </div>
          </div>
          
          <div className="grid-izgarasi" style={{ gap: '1rem', marginBottom: '0' }}>
            <div className="form-grubu">
              <label>Bina Yaşı</label>
              <select name="bina_yasi" className="form-kontrol" onChange={degisimAlici} value={ilanBilgileri.bina_yasi}>
                <option value="Sıfır">Sıfır</option>
                <option value="1-5 Yıl">1-5 Yıl</option>
                <option value="6-10 Yıl">6-10 Yıl</option>
                <option value="11-20 Yıl">11-20 Yıl</option>
                <option value="21+ Yıl">21+ Yıl</option>
              </select>
            </div>
            
            <div className="form-grubu">
              <label>Isıtma</label>
              <select name="isitma" className="form-kontrol" onChange={degisimAlici} value={ilanBilgileri.isitma}>
                <option value="Doğalgaz (Kombi)">Doğalgaz (Kombi)</option>
                <option value="Merkezi">Merkezi</option>
                <option value="Yerden Isıtma">Yerden Isıtma</option>
                <option value="Klima">Klima</option>
                <option value="Isıtma Yok">Isıtma Yok</option>
              </select>
            </div>
          </div>

          <div className="grid-izgarasi" style={{ gap: '1rem', marginBottom: '0' }}>
            <div className="form-grubu">
              <label>Banyo Sayısı</label>
              <input type="number" min="1" name="banyo_sayisi" className="form-kontrol" onChange={degisimAlici} value={ilanBilgileri.banyo_sayisi} />
            </div>
            
            <div className="form-grubu" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="balkon" checked={ilanBilgileri.balkon} onChange={degisimAlici} style={{ width: '18px', height: '18px' }} />
                <span>Balkon Var</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="esyalimi" checked={ilanBilgileri.esyalimi} onChange={degisimAlici} style={{ width: '18px', height: '18px' }} />
                <span>Eşyalı</span>
              </label>
            </div>
          </div>
          
          <div className="form-grubu">
            <label>Konum</label>
            <input type="text" name="konum" className="form-kontrol" placeholder="Örn: İstanbul, Kadıköy" value={ilanBilgileri.konum} onChange={degisimAlici} />
          </div>
          
          <div className="form-grubu">
            <label>Resim URL'leri (Birden fazla resim için virgülle ayırın)</label>
            <textarea name="resim_url" className="form-kontrol" placeholder="https://resim1.jpg, https://resim2.jpg" value={ilanBilgileri.resim_url} onChange={degisimAlici} rows="3"></textarea>
          </div>
          
          <button type="submit" className="btn btn-birincil" style={{ width: '100%', marginTop: '1rem' }}>
            İlanı Güncelle
          </button>
        </form>
      </div>
    </div>
  );
};

export default IlanDuzenle;
