import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useKullanici } from '../baglam/kullanici_baglami';
import { MessageSquare, Send, CornerDownRight, User } from 'lucide-react';

const Yorumlar = ({ ilanId, ilanSahibiId }) => {
  const { kullanici, token } = useKullanici();
  const [yorumlar, setYorumlar] = useState([]);
  const [yeniYorum, setYeniYorum] = useState('');
  const [yanitGirisGoster, setYanitGirisGoster] = useState(null);
  const [yeniYanit, setYeniYanit] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  // ilanSahibi mi kontrolü
  const ilanSahibiMi = kullanici && (kullanici.id === ilanSahibiId || kullanici.rol === 'admin');

  const yorumlariGetir = async () => {
    try {
      const yanit = await fetch(`${API_URL}/api/yorumlar/${ilanId}`);
      if (yanit.ok) {
        const veri = await yanit.json();
        setYorumlar(veri);
      }
    } catch (hata) {
      console.error('Yorumlar yüklenemedi:', hata);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    yorumlariGetir();
  }, [ilanId]);

  const yorumGonder = async (e) => {
    e.preventDefault();
    if (!token || !yeniYorum.trim()) return;

    try {
      const yanit = await fetch(`${API_URL}/api/yorumlar/${ilanId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ icerik: yeniYorum })
      });
      
      if (yanit.ok) {
        setYeniYorum('');
        yorumlariGetir(); // Listeyi yenile
      }
    } catch (hata) {
      console.error('Yorum eklenemedi:', hata);
    }
  };

  const yanitGonder = async (e, yorumId) => {
    e.preventDefault();
    if (!token || !yeniYanit.trim()) return;

    try {
      const yanit = await fetch(`${API_URL}/api/yorumlar/yanit/${yorumId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ icerik: yeniYanit })
      });
      
      if (yanit.ok) {
        setYeniYanit('');
        setYanitGirisGoster(null);
        yorumlariGetir(); // Listeyi yenile
      }
    } catch (hata) {
      console.error('Yanıt eklenemedi:', hata);
    }
  };

  if (yukleniyor) return <div style={{ color: 'var(--metin-ikincil)' }}>Yorumlar yükleniyor...</div>;

  return (
    <div className="cam-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-kenarlik)', paddingBottom: '1rem' }}>
        <MessageSquare size={24} color="var(--birincil)" /> 
        Soru & Cevap 
        <span style={{ fontSize: '1rem', color: 'var(--metin-ikincil)', fontWeight: 'normal' }}>({yorumlar.length})</span>
      </h3>

      {/* Yorum Yapma Alanı */}
      {kullanici ? (
        <form onSubmit={yorumGonder} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flexGrow: 1 }}>
            <textarea 
              className="form-kontrol" 
              placeholder="İlan hakkında bir soru sorun veya yorum yapın..."
              rows="2"
              value={yeniYorum}
              onChange={(e) => setYeniYorum(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="btn btn-birincil" style={{ height: 'fit-content' }}>
            <Send size={16} /> Gönder
          </button>
        </form>
      ) : (
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', marginBottom: '2.5rem', color: 'var(--metin-ikincil)' }}>
          Soru sormak veya yorum yapmak için giriş yapmalısınız.
        </div>
      )}

      {/* Yorumlar Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {yorumlar.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--metin-ikincil)', padding: '1rem' }}>
            Henüz yorum yapılmamış. İlk soran siz olun!
          </div>
        ) : (
          yorumlar.map((yorum) => (
            <div key={yorum.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--vurgu-birincil)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                    {yorum.ad_soyad.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{yorum.ad_soyad}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--metin-ikincil)' }}>{new Date(yorum.olusturma_tarihi).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              </div>
              
              <div className="yorum-icerik" style={{ paddingLeft: '3.3rem', color: 'var(--metin-ana)', marginBottom: '1rem' }}>
                {yorum.icerik}
              </div>

              {/* Yanıtlar */}
              {yorum.yanitlar && yorum.yanitlar.length > 0 && (
                <div className="yanit-konteyner" style={{ marginLeft: '3.3rem', background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--birincil)' }}>
                  {yorum.yanitlar.map(yanit => (
                    <div key={yanit.id} style={{ marginBottom: yanit === yorum.yanitlar[yorum.yanitlar.length - 1] ? '0' : '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <User size={16} color="var(--birincil)" />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--birincil)' }}>İlan Sahibi'nin Yanıtı</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--metin-ikincil)', marginLeft: 'auto' }}>
                          {new Date(yanit.olusturma_tarihi).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>{yanit.icerik}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Yanıt Ver Butonu ve Formu (Sadece İlan Sahibine Özel) */}
              {ilanSahibiMi && (!yorum.yanitlar || yorum.yanitlar.length === 0) && (
                <div className="yanit-butonu-alani" style={{ marginLeft: '3.3rem', marginTop: '1rem' }}>
                  {yanitGirisGoster === yorum.id ? (
                    <form onSubmit={(e) => yanitGonder(e, yorum.id)} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <textarea 
                        className="form-kontrol" 
                        placeholder="Bu soruya yanıtınız..."
                        rows="1"
                        value={yeniYanit}
                        onChange={(e) => setYeniYanit(e.target.value)}
                        style={{ resize: 'vertical', background: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', padding: '0.8rem' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-birincil" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Gönder</button>
                        <button type="button" className="btn btn-ikincil" onClick={() => setYanitGirisGoster(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>İptal</button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => { setYanitGirisGoster(yorum.id); setYeniYanit(''); }}
                      className="btn btn-ikincil" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CornerDownRight size={14} /> Yanıt Ver
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    <style>{`
      @media (max-width: 576px) {
        .cam-panel {
          padding: 1.2rem !important;
        }
        
        .yorum-icerik {
          padding-left: 0 !important;
          margin-top: 0.8rem;
        }
        
        .yanit-konteyner, .yanit-butonu-alani {
          margin-left: 1rem !important;
        }
      }
    `}</style>
    </div>
  );
};

export default Yorumlar;
