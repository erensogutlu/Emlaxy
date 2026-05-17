import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKullanici } from '../baglam/kullanici_baglami';
import { useModal } from '../baglam/modal_baglami';
import { toast } from 'react-hot-toast';
import { MapPin, Maximize, Bed, Calendar, User, Trash2, Home, Droplets, Wind, Sun, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import Yorumlar from '../bilesenler/Yorumlar';

const IlanDetay = () => {
  const { id } = useParams();
  const yonlendir = useNavigate();
  const { kullanici, token } = useKullanici();
  const { onayIste } = useModal();
  const [ilan, setIlan] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifResimIndeks, setAktifResimIndeks] = useState(0);
  const [tamEkran, setTamEkran] = useState(false);

  useEffect(() => {
    const ilanGetir = async () => {
      try {
        const yanit = await fetch(`http://127.0.0.1:5000/api/ilanlar/${id}`);
        if (yanit.ok) {
          const veri = await yanit.json();
          setIlan(veri);
        } else {
          yonlendir('/');
        }
      } catch (hata) {
        console.error('İlan detayı alınamadı:', hata);
      } finally {
        setYukleniyor(false);
      }
    };
    ilanGetir();
  }, [id, yonlendir]);

  const ilanSil = async () => {
    const onay = await onayIste('Bu ilanı silmek istediğinize emin misiniz?');
    if (!onay) return;
    
    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/ilanlar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (yanit.ok) {
        toast.success('İlan başarıyla silindi');
        yonlendir('/');
      } else {
        toast.error('İlan silinirken bir hata oluştu');
      }
    } catch (hata) {
      console.error('silme hatası:', hata);
    }
  };

  if (yukleniyor) return <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>;
  if (!ilan) return null;

  const sahipMi = kullanici && (kullanici.id === ilan.ekleyen_id || kullanici.rol === 'admin');

  const resimler = ilan.resim_url ? ilan.resim_url.split(',').map(r => r.trim()).filter(r => r !== '') : [];
  if (resimler.length === 0) resimler.push('https://placehold.co/1200x800/18181b/8b5cf6?text=Emlaxy+İlan+Görseli');

  return (
    <div className="animasyon-asagi">
      <button 
        onClick={() => yonlendir('/')} 
        className="btn-link" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--metin-ikincil)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={20} /> İlanlar Listesine Dön
      </button>
      <div className="ilan-detay-grid">
        {/* Sol Kolon - Medya ve Açıklama */}
        <div>
          <div className="ilan-galeri" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setTamEkran(true)}>
            <img src={resimler[aktifResimIndeks] || resimler[0]} alt={ilan.baslik} />
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 0.8rem', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Maximize size={18} /> Büyüt
            </div>
          </div>
          {resimler.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {resimler.map((resim, idx) => (
                <img 
                  key={idx} 
                  src={resim} 
                  alt={`${ilan.baslik} - ${idx + 1}`} 
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: aktifResimIndeks === idx ? '2px solid var(--birincil)' : '2px solid transparent', transition: 'all 0.3s ease' }} 
                  onClick={() => setAktifResimIndeks(idx)}
                />
              ))}
            </div>
          )}
          
          <div className="cam-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--birincil)' }}>İlan Açıklaması</h2>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--metin-ana)' }}>
              {ilan.aciklama || 'Bu ilan için henüz bir açıklama girilmemiştir.'}
            </p>
          </div>
        </div>

        {/* Sağ Kolon - Detaylar ve İletişim */}
        <div>
          <div className="cam-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{ilan.baslik}</h2>
              <span className={`etiket ${ilan.islem_tipi === 'satilik' ? 'etiket-yakut' : 'etiket-zumrut'}`}>
                {ilan.islem_tipi === 'satilik' ? 'Satılık' : 'Kiralık'}
              </span>
            </div>
            
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--birincil)', marginBottom: '2rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              {Number(ilan.fiyat).toLocaleString('tr-TR')} <span style={{ fontSize: '1.5rem' }}>₺</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <MapPin className="logo-ikon" /> {ilan.konum}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Bed className="logo-ikon" /> {ilan.oda_sayisi} Oda
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Maximize className="logo-ikon" /> {ilan.metrekare} Metrekare
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Calendar className="logo-ikon" /> İlan Tarihi: {new Date(ilan.olusturma_tarihi).toLocaleDateString('tr-TR')}
              </div>
            </div>

            {/* Yeni Özellikler Izgarası */}
            <div className="ilan-detay-ozellikler-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Home size={18} color="var(--ikincil)" /> Bina Yaşı: <strong style={{ color: 'white' }}>{ilan.bina_yasi || 'Bilinmiyor'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Droplets size={18} color="var(--ikincil)" /> Banyo: <strong style={{ color: 'white' }}>{ilan.banyo_sayisi || '-'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Wind size={18} color="var(--ikincil)" /> Isıtma: <strong style={{ color: 'white' }}>{ilan.isitma || 'Bilinmiyor'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Sun size={18} color="var(--ikincil)" /> Balkon: <strong style={{ color: 'white' }}>{ilan.balkon ? 'Var' : 'Yok'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--metin-ana)' }}>
                <Package size={18} color="var(--ikincil)" /> Eşyalı: <strong style={{ color: 'white' }}>{ilan.esyalimi ? 'Evet' : 'Hayır'}</strong>
              </div>
            </div>

            {sahipMi && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button className="btn btn-birincil" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => yonlendir(`/ilan/${ilan.id}/duzenle`)}>
                  İlanı Düzenle
                </button>
                <button className="btn btn-tehlike" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={ilanSil}>
                  <Trash2 size={18} /> İlanı Sil
                </button>
              </div>
            )}
          </div>

          <div className="cam-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-kenarlik)', paddingBottom: '0.5rem' }}>Emlakçı Bilgileri</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--birincil)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {ilan.ekleyen_ad_soyad.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ilan.ekleyen_ad_soyad}</div>
                <div style={{ color: 'var(--metin-ikincil)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                  <User size={14} /> Üye
                </div>
              </div>
            </div>

            
            {kullanici ? (
              <button 
                onClick={() => yonlendir(`/mesajlar?ilan=${ilan.id}&alici=${ilan.ekleyen_id}`)}
                className="btn btn-birincil" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <MessageCircle size={18} /> Ekosistemden Mesaj Gönder
              </button>
            ) : (
              <button 
                onClick={() => { toast.error('Mesaj göndermek için giriş yapmalısınız.'); yonlendir('/giris'); }}
                className="btn btn-birincil" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <MessageCircle size={18} /> Giriş Yap ve Mesaj Gönder
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Alt Bölüm - Yorumlar */}
      <Yorumlar ilanId={ilan.id} ilanSahibiId={ilan.ekleyen_id} />
      
      {/* Tam Ekran Galeri Modalı */}
      {tamEkran && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setTamEkran(false)}>
          <button onClick={() => setTamEkran(false)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '3rem', cursor: 'pointer', zIndex: 10001 }}>&times;</button>
          
          {resimler.length > 1 && (
            <button 
               onClick={(e) => { e.stopPropagation(); setAktifResimIndeks(prev => prev === 0 ? resimler.length - 1 : prev - 1); }} 
               style={{ position: 'absolute', left: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '2.5rem', cursor: 'pointer', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10001, transition: 'all 0.3s' }}
               onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
               onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
               &#10094;
            </button>
          )}

          <img src={resimler[aktifResimIndeks] || resimler[0]} alt="Tam Ekran" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()} />

          {resimler.length > 1 && (
            <button 
               onClick={(e) => { e.stopPropagation(); setAktifResimIndeks(prev => prev === resimler.length - 1 ? 0 : prev + 1); }} 
               style={{ position: 'absolute', right: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '2.5rem', cursor: 'pointer', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10001, transition: 'all 0.3s' }}
               onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
               onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
               &#10095;
            </button>
          )}
        </div>
      )}
      <style>{`
        .ilan-detay-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 3rem;
          animation: asagidanKay 0.6s ease forwards;
        }

        @media (max-width: 992px) {
          .ilan-detay-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
          }
          
          .ilan-galeri {
            height: 380px;
            margin-bottom: 0.8rem;
          }
          
          .cam-panel {
            padding: 1.25rem !important;
          }
        }

        @media (max-width: 576px) {
          .ilan-galeri {
            height: 250px;
          }
          
          .ilan-detay-ozellikler-grid {
            grid-template-columns: 1fr !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default IlanDetay;
