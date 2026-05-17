import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useKullanici } from '../baglam/kullanici_baglami';
import { useModal } from '../baglam/modal_baglami';
import { toast } from 'react-hot-toast';
import IlanKarti from '../bilesenler/IlanKarti';
import { useNavigate } from 'react-router-dom';
import { User, Heart, List, Calendar, Search, Trash2 } from 'lucide-react';

const Profilim = () => {
  const { kullanici, token } = useKullanici();
  const { onayIste } = useModal();
  // Role göre varsayılan sekmeyi belirle
  const varsayilanSekme = kullanici?.rol === 'emlakci' || kullanici?.rol === 'admin' ? 'ilanlarim' : 'favorilerim';
  const [aktifSekme, setAktifSekme] = useState(varsayilanSekme);
  const [profilVerisi, setProfilVerisi] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [kayitliAramalar, setKayitliAramalar] = useState([]);
  const yonlendir = useNavigate();

  const profilGetir = async () => {
    try {
      const yanit = await fetch(`${API_URL}/api/kullanicilar/profil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const aramaYanit = await fetch(`${API_URL}/api/aramalar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const veri = await yanit.json();

      if (yanit.ok && aramaYanit.ok) {
        setProfilVerisi(veri);
        setKayitliAramalar(await aramaYanit.json());
      } else {
        setHata(veri.hata || 'Profil bilgileri alınamadı.');
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı.');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    if (token) {
      profilGetir();
    }
  }, [token]);

  if (yukleniyor) {
    return (
      <div className="sayfa-icerigi" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--metin-ikincil)', fontSize: '1.2rem' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (hata) {
    return (
      <div className="sayfa-icerigi" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--durum-hata)', fontSize: '1.2rem' }}>İşlem Başarısız: {hata}</div>
      </div>
    );
  }

  if (!profilVerisi) return null;

  const { kullanici: user, benimIlanlarim, favoriIlanlarim } = profilVerisi;

  return (
    <div className="sayfa-icerigi animasyon-asagi">
      <div className="baslik-alani">
        <div>
          <h2>Profilim</h2>
          <p>Bireysel verilerinizi ve ilanlarınızı buradan yönetebilirsiniz.</p>
        </div>
      </div>

      <div className="profil-grid">
        {/* Sol Panel: Kullanıcı Bilgileri */}
        <div className="panel" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--panel-kenarlik)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: 'var(--vurgu-birincil)', color: 'white',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'
            }}>
              {user.ad_soyad.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{user.ad_soyad}</h3>
            <span className="etiket etiket-ametist" style={{ fontSize: '0.8rem' }}>
              {user.rol === 'admin' ? 'Yönetici' : user.rol === 'emlakci' ? 'Emlak Danışmanı' : 'Bireysel Hesap'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--metin-ikincil)', marginBottom: '0.2rem' }}>E-Posta</div>
              <div>{user.eposta}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--metin-ikincil)', marginBottom: '0.2rem' }}>Kayıt Tarihi</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--metin-ikincil)" />
                {new Date(user.kayit_tarihi).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Panel: Sekmeler ve İçerik */}
        <div className="profil-icerik-alani">
          <div className="profil-sekme-alani">
            {(user.rol === 'emlakci' || user.rol === 'admin') && (
              <button 
                className={`btn ${aktifSekme === 'ilanlarim' ? 'btn-birincil' : 'btn-ikincil'}`}
                onClick={() => setAktifSekme('ilanlarim')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <List size={18} /> Vitrin / İlanlarım ({benimIlanlarim.length})
              </button>
            )}
            <button 
              className={`btn ${aktifSekme === 'favorilerim' ? 'btn-birincil' : 'btn-ikincil'}`}
              onClick={() => setAktifSekme('favorilerim')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Heart size={18} /> Favorilerim ({favoriIlanlarim.length})
            </button>
            <button 
              className={`btn ${aktifSekme === 'kayitli_aramalar' ? 'btn-birincil' : 'btn-ikincil'}`}
              onClick={() => setAktifSekme('kayitli_aramalar')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Search size={18} /> Kayıtlı Aramalarım ({kayitliAramalar.length})
            </button>
          </div>

          {aktifSekme === 'kayitli_aramalar' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {kayitliAramalar.length > 0 ? (
                kayitliAramalar.map(arama => {
                  const filtre = JSON.parse(arama.filtreler_json);
                  return (
                    <div key={arama.id} className="cam-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--birincil)' }}>{arama.baslik}</h3>
                      <div style={{ fontSize: '0.9rem', color: 'var(--metin-ana)' }}>
                        {filtre.islem_tipi && <div>İşlem: {filtre.islem_tipi}</div>}
                        {filtre.konum && <div>Konum: {filtre.konum}</div>}
                        {filtre.min_fiyat && <div>Min Fiyat: {filtre.min_fiyat} ₺</div>}
                        {filtre.max_fiyat && <div>Max Fiyat: {filtre.max_fiyat} ₺</div>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--metin-ikincil)' }}>
                        Kayıt Tarihi: {new Date(arama.olusturma_tarihi).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button 
                          onClick={() => {
                            const params = new URLSearchParams(Object.entries(filtre).filter(([_, v]) => v !== '')).toString();
                            yonlendir(`/?${params}`);
                          }}
                          className="btn btn-birincil" 
                          style={{ flex: 1, padding: '0.5rem' }}
                        >
                          Sonuçları Göster
                        </button>
                        <button 
                          onClick={async () => {
                            const onay = await onayIste('Bu aramayı silmek istediğinize emin misiniz?');
                            if(onay) {
                              try {
                                const yanit = await fetch(`${API_URL}/api/aramalar/${arama.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
                                if (yanit.ok) {
                                  toast.success('Arama silindi');
                                  setKayitliAramalar(kayitliAramalar.filter(k => k.id !== arama.id));
                                } else {
                                  toast.error('Silme işlemi başarısız');
                                }
                              } catch(e) {
                                toast.error('Bir hata oluştu');
                              }
                            }
                          }}
                          className="btn btn-tehlike" 
                          style={{ padding: '0.5rem' }} title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--metin-ikincil)', gridColumn: '1 / -1' }}>
                  Kayıtlı hiçbir aramanız bulunmamaktadır.
                </div>
              )}
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {aktifSekme === 'ilanlarim' && (
              benimIlanlarim.length > 0 ? (
                benimIlanlarim.map((ilan, index) => (
                  <IlanKarti key={ilan.id} ilan={ilan} index={index} />
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--metin-ikincil)', gridColumn: '1 / -1' }}>
                  Henüz bir ilan oluşturmadınız.
                </div>
              )
            )}

            {aktifSekme === 'favorilerim' && (
              favoriIlanlarim.length > 0 ? (
                favoriIlanlarim.map((ilan, index) => (
                  <IlanKarti key={ilan.id} ilan={ilan} index={index} />
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--metin-ikincil)', gridColumn: '1 / -1' }}>
                  Favorilerinize eklenmiş ilan bulunmuyor.
                </div>
              )
            )}
          </div>
          )}
        </div>
      </div>
      <style>{`
        .profil-grid {
          display: grid;
          grid-template-columns: 1fr 3fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .profil-sekme-alani {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--panel-kenarlik);
          padding-bottom: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          white-space: nowrap;
          padding-right: 1rem;
        }

        .profil-sekme-alani .btn {
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .profil-grid {
            grid-template-columns: 1fr;
          }
          
          .profil-sekme-alani {
            margin: 0 0 1.5rem 0;
            padding: 0 0 1rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Profilim;
