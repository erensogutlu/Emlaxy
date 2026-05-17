import React, { useState, useEffect, useRef } from 'react';
import { useKullanici } from '../baglam/kullanici_baglami';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Send, User, MessageCircle, Trash2, Shield, ShieldOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useModal } from '../baglam/modal_baglami';

const Mesajlar = () => {
  const { kullanici, token, yukleniyor: authYukleniyor } = useKullanici();
  const konum = useLocation();
  const queryParams = new URLSearchParams(konum.search);
  const ilkIlanId = queryParams.get('ilan');
  const ilkAliciId = queryParams.get('alici');

  const [sohbetler, setSohbetler] = useState([]);
  const [aktifSohbet, setAktifSohbet] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [engelDurumu, setEngelDurumu] = useState({ benEngelledim: false, oEngelledi: false });
  const { onayIste } = useModal();
  const mesajlarSonuRef = useRef(null);

  // Scroll to bottom
  const asagiKaydir = () => {
    mesajlarSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    asagiKaydir();
  }, [mesajlar]);

  // Sohbetleri Getir
  const sohbetleriYukle = async () => {
    try {
      const yanit = await fetch('http://127.0.0.1:5000/api/mesajlar/sohbetler', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (yanit.ok) {
        const veri = await yanit.json();
        setSohbetler(veri);
        
        // Sadece Query param ile gelmişse seç (sayfaya dışarıdan yönlendirilme durumu)
        if (ilkIlanId && ilkAliciId) {
          sohbetSec({ ilan_id: ilkIlanId, karsi_id: ilkAliciId });
        }
      }
    } catch (hata) {
      console.error('Sohbetler yüklenemedi:', hata);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    if (kullanici && token) {
      sohbetleriYukle();
    }
  }, [kullanici, token]);

  const sohbetSec = async (sohbet) => {
    setAktifSohbet(sohbet);
    try {
      // Mesajları yükle
      const yanit = await fetch(`http://127.0.0.1:5000/api/mesajlar/sohbet/${sohbet.karsi_id}/${sohbet.ilan_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (yanit.ok) {
        setMesajlar(await yanit.json());
      }

      // Engel durumunu yükle
      const engelYanit = await fetch(`http://127.0.0.1:5000/api/kullanicilar/engel-durumu/${sohbet.karsi_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (engelYanit.ok) {
        setEngelDurumu(await engelYanit.json());
      }
    } catch (hata) {
      console.error('Veriler yüklenemedi:', hata);
    }
  };

  const mesajSil = async (mesajId) => {
    const onay = await onayIste('Bu mesajı silmek istediğinize emin misiniz?');
    if (!onay) return;

    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/mesajlar/${mesajId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (yanit.ok) {
        toast.success('Mesaj silindi');
        setMesajlar(mesajlar.filter(m => m.id !== mesajId));
      } else {
        toast.error('Mesaj silinemedi');
      }
    } catch (hata) {
      toast.error('Bir hata oluştu');
    }
  };

  const kullaniciEngelle = async () => {
    const islem = engelDurumu.benEngelledim ? 'Engeli kaldırmak' : 'Kullanıcıyı engellemek';
    const onay = await onayIste(`${islem} istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const yanit = await fetch('http://127.0.0.1:5000/api/kullanicilar/engelle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ engellenen_id: aktifSohbet.karsi_id })
      });

      if (yanit.ok) {
        const veri = await yanit.json();
        setEngelDurumu({ ...engelDurumu, benEngelledim: veri.engellenen });
        toast.success(veri.mesaj);
      }
    } catch (hata) {
      toast.error('Bir hata oluştu');
    }
  };

  const sohbetSil = async (e, sohbet) => {
    e.stopPropagation(); // Sohbet seçilmesini engelle
    const onay = await onayIste(`"${sohbet.karsi_ad_soyad}" ile olan tüm sohbet geçmişini silmek istediğinize emin misiniz?`);
    if (!onay) return;

    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/mesajlar/sohbet/${sohbet.karsi_id}/${sohbet.ilan_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (yanit.ok) {
        toast.success('Sohbet silindi');
        if (aktifSohbet && aktifSohbet.ilan_id === sohbet.ilan_id && aktifSohbet.karsi_id === sohbet.karsi_id) {
          setAktifSohbet(null);
          setMesajlar([]);
        }
        sohbetleriYukle();
      }
    } catch (hata) {
      toast.error('Bir hata oluştu');
    }
  };

  const mesajGonder = async (e) => {
    e.preventDefault();
    if (!yeniMesaj.trim() || !aktifSohbet) return;

    try {
      const yanit = await fetch('http://127.0.0.1:5000/api/mesajlar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ilan_id: aktifSohbet.ilan_id,
          alici_id: aktifSohbet.karsi_id,
          icerik: yeniMesaj
        })
      });

      if (yanit.ok) {
        const gonderilen = await yanit.json();
        // İyimser ekleme yapıp tam veriyi sunucudan tazeleyebiliriz
        setMesajlar([...mesajlar, { ...gonderilen, gonderen_ad_soyad: kullanici.ad_soyad }]);
        setYeniMesaj('');
        sohbetleriYukle(); // Son mesaj tarihini güncellemek için sol barı yenile
      }
    } catch (hata) {
      console.error('Mesaj gönderilemedi:', hata);
    }
  };

  if (authYukleniyor || yukleniyor) {
    return (
      <div className="sayfa-icerigi" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--metin-ikincil)', fontSize: '1.2rem' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!kullanici) return <Navigate to="/giris" />;

  return (
    <div className="sayfa-icerigi animasyon-asagi" style={{ padding: '2rem 0', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <div className="baslik-alani" style={{ marginBottom: '1rem' }}>
        <h2>Mesajlarım</h2>
      </div>

      <div className="cam-panel" style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
        
        {/* Sol Panel: Sohbet Listesi */}
        <div className={`mesaj-listesi-paneli ${aktifSohbet ? 'mobil-gizli' : ''}`} style={{ width: '350px', borderRight: '1px solid var(--panel-kenarlik)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-kenarlik)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={20} color="var(--birincil)" /> Konuşmalar
            </h3>
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {sohbetler.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--metin-ikincil)' }}>
                Henüz hiçbir mesajınız yok.
              </div>
            ) : (
              sohbetler.map(sohbet => {
                const aktifMi = aktifSohbet && aktifSohbet.ilan_id === sohbet.ilan_id && aktifSohbet.karsi_id === sohbet.karsi_id;
                return (
                  <div 
                    key={`${sohbet.ilan_id}-${sohbet.karsi_id}`}
                    onClick={() => sohbetSec(sohbet)}
                    style={{ 
                      display: 'flex', padding: '1rem', gap: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--panel-kenarlik)',
                      backgroundColor: aktifMi ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                      <img src={sohbet.resim_url ? sohbet.resim_url.split(',')[0].trim() : 'https://via.placeholder.com/50'} alt="ilan foto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: 'var(--birincil)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                        {sohbet.karsi_ad_soyad ? sohbet.karsi_ad_soyad.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div style={{ overflow: 'hidden', flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sohbet.karsi_ad_soyad}
                        </div>
                        <button 
                          onClick={(e) => sohbetSil(e, sohbet)}
                          style={{ background: 'none', border: 'none', color: 'var(--metin-ikincil)', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                          onMouseOver={(e) => e.target.style.opacity = 1}
                          onMouseOut={(e) => e.target.style.opacity = 0.6}
                          title="Sohbeti Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ikincil)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        İlan: {sohbet.ilan_baslik}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ Panel: Mesaj Geçmişi */}
        <div className={`mesaj-icerik-paneli ${!aktifSohbet ? 'mobil-gizli' : ''}`} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 5, 0.5)' }}>
          {aktifSohbet ? (
            <>
              {/* Aktif Sohbet Başlığı */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-kenarlik)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => setAktifSohbet(null)} 
                  className="masaustu-gizle" 
                  style={{ background: 'none', border: 'none', color: 'var(--ikincil)', cursor: 'pointer', padding: '0.5rem 0.5rem 0.5rem 0' }}
                >
                  <ArrowLeft size={24} />
                </button>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--birincil)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'white' }}>
                  {aktifSohbet.karsi_ad_soyad ? aktifSohbet.karsi_ad_soyad.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{aktifSohbet.karsi_ad_soyad}</div>
                  <Link to={`/ilan/${aktifSohbet.ilan_id}`} style={{ fontSize: '0.85rem', color: 'var(--ikincil)' }}>
                    İlana Git: {aktifSohbet.ilan_baslik}
                  </Link>
                </div>
                <button 
                  onClick={kullaniciEngelle}
                  className="btn" 
                  style={{ 
                    backgroundColor: engelDurumu.benEngelledim ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: engelDurumu.benEngelledim ? '#ef4444' : 'var(--metin-ikincil)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {engelDurumu.benEngelledim ? <><ShieldOff size={16} /> Engeli Kaldır</> : <><Shield size={16} /> Engelle</>}
                </button>
              </div>

              {/* Mesaj Alanı */}
              <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mesajlar.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--metin-ikincil)', margin: 'auto' }}>
                    Burada henüz mesaj yok. İlk mesajı siz gönderin!
                  </div>
                ) : (
                  mesajlar.map((mesaj, index) => {
                    const benimMesajim = mesaj.gonderen_id === kullanici.id;
                    return (
                      <div key={index} style={{ display: 'flex', justifyContent: benimMesajim ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', padding: '0.8rem 1.2rem', borderRadius: '15px',
                          borderBottomRightRadius: benimMesajim ? '0' : '15px',
                          borderBottomLeftRadius: !benimMesajim ? '0' : '15px',
                          backgroundColor: benimMesajim ? 'var(--birincil)' : 'rgba(255,255,255,0.1)',
                          color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          position: 'relative', group: 'true'
                        }} className="mesaj-balonu">
                          <div style={{ fontSize: '0.95rem' }}>{mesaj.icerik}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', gap: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(mesaj.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {benimMesajim && (
                              <button 
                                onClick={() => mesajSil(mesaj.id)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, display: 'flex' }}
                                title="Mesajı Sil"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={mesajlarSonuRef} />
              </div>

              {/* Mesaj Gönderme Formu veya Engel Uyarısı */}
              {engelDurumu.benEngelledim || engelDurumu.oEngelledi ? (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--panel-kenarlik)', backgroundColor: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', color: 'var(--tehlike)' }}>
                  <AlertCircle size={20} />
                  <span>{engelDurumu.benEngelledim ? 'Bu kullanıcıyı engellediniz.' : 'Bu kullanıcı tarafından engellendiniz.'}</span>
                </div>
              ) : (
                <form onSubmit={mesajGonder} style={{ padding: '1.2rem', borderTop: '1px solid var(--panel-kenarlik)', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-kontrol" 
                    placeholder="Mesaj yazın..." 
                    value={yeniMesaj}
                    onChange={(e) => setYeniMesaj(e.target.value)}
                    style={{ borderRadius: '25px', paddingLeft: '1.5rem' }}
                  />
                  <button type="submit" className="btn btn-birincil" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: '0', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Send size={20} style={{ marginLeft: '-2px' }} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--metin-ikincil)' }}>
              Sohbet başlatmak veya görüntülemek için sol taraftan bir kişi seçin.
            </div>
          )}
        </div>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .mesaj-listesi-paneli {
            width: 100% !important;
            border-right: none !important;
          }
          
          .mesaj-icerik-paneli {
            width: 100% !important;
          }
          
          .mobil-gizli {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Mesajlar;
