import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useKullanici } from '../baglam/kullanici_baglami';
import { Eye, EyeOff, Info, User, Shield, Briefcase } from 'lucide-react';

const GirisYap = () => {
  const [kayitMi, setKayitMi] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [formMaddeleri, setFormMaddeleri] = useState({
    ad_soyad: '',
    eposta: '',
    sifre: '',
    rol: 'bireysel'
  });
  const [hata, setHata] = useState('');
  const { giris, kullanici, yukleniyor: authYukleniyor } = useKullanici();
  const demoHesapDoldur = (eposta, sifre) => {
    setFormMaddeleri({ ...formMaddeleri, eposta, sifre });
    setHata('');
  };

  const degisimAlici = (e) => {
    setFormMaddeleri({ ...formMaddeleri, [e.target.name]: e.target.value });
  };

  const formGonder = async (e) => {
    e.preventDefault();
    setHata('');
    const ucNokta = kayitMi ? '/kayit' : '/giris';

    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/kullanicilar${ucNokta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formMaddeleri)
      });
      
      const veri = await yanit.json();
      
      if (yanit.ok) {
        giris(veri.kullanici, veri.token);
        yonlendir('/');
      } else {
        setHata(veri.hata || 'bir hata oluştu');
      }
    } catch (err) {
      setHata('sunucuya bağlanılamadı');
    }
  };

  if (authYukleniyor) return null;
  if (kullanici) return <Navigate to="/" />;

  return (
    <div className="form-sayfa-kapsayici">
      <div className="cam-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {kayitMi ? 'Kayıt Ol' : 'Giriş Yap'}
        </h2>
        {hata && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--tehlike)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--tehlike)' }}>
            {hata}
          </div>
        )}
        <form onSubmit={formGonder}>
          {kayitMi && (
            <>
              <div className="form-grubu" style={{ marginBottom: '1rem' }}>
                <label>Hesap Tipi</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--metin-ana)' }}>
                    <input type="radio" name="rol" value="bireysel" checked={formMaddeleri.rol === 'bireysel'} onChange={degisimAlici} />
                    Bireysel Hesap
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--metin-ana)' }}>
                    <input type="radio" name="rol" value="emlakci" checked={formMaddeleri.rol === 'emlakci'} onChange={degisimAlici} />
                    Emlak Danışmanı
                  </label>
                </div>
              </div>
              <div className="form-grubu">
                <label>{formMaddeleri.rol === 'emlakci' ? 'Ad Soyad / Firma Adı' : 'Ad Soyad'}</label>
                <input type="text" name="ad_soyad" className="form-kontrol" required value={formMaddeleri.ad_soyad} onChange={degisimAlici} />
              </div>
            </>
          )}
          <div className="form-grubu">
            <label>E-posta</label>
            <input type="email" name="eposta" className="form-kontrol" required value={formMaddeleri.eposta} onChange={degisimAlici} />
          </div>
          <div className="form-grubu">
            <label>Şifre</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={sifreGoster ? 'text' : 'password'} 
                name="sifre" 
                className="form-kontrol" 
                value={formMaddeleri.sifre} 
                onChange={degisimAlici} 
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setSifreGoster(!sifreGoster)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--metin-ikincil)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                {sifreGoster ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-birincil" style={{ width: '100%', marginBottom: '1rem' }}>
            {kayitMi ? 'Hesap Oluştur' : 'Giriş Yap'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--panel-kenarlik)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--metin-ikincil)', fontSize: '0.95rem' }}>
            {kayitMi ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
          </span>
          <button 
            type="button"
            className="btn-link" 
            onClick={() => { setKayitMi(!kayitMi); setSifreGoster(false); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--birincil)', 
              fontWeight: '600', 
              marginLeft: '0.5rem', 
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {kayitMi ? 'Giriş Yapın' : 'Kayıt Olun'}
          </button>
        </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-kenarlik)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--birincil)', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <div style={{ height: '1px', flexGrow: 1, background: 'linear-gradient(to right, transparent, var(--panel-kenarlik))' }}></div>
              <Info size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--metin-ikincil)' }}>Hızlı Test Hesapları</span>
              <div style={{ height: '1px', flexGrow: 1, background: 'linear-gradient(to left, transparent, var(--panel-kenarlik))' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
              <button 
                onClick={() => demoHesapDoldur('admin@emlaxy.com', 'EmlaxyAdmin123!')}
                className="demo-btn"
              >
                <div className="demo-icon admin"><Shield size={14} /></div>
                <div className="demo-info">
                  <div className="demo-row"><strong>Admin</strong></div>
                  <div className="demo-row"><span>E-posta:</span> admin@emlaxy.com</div>
                  <div className="demo-row"><span>Şifre:</span> EmlaxyAdmin123!</div>
                </div>
              </button>
              <button 
                onClick={() => demoHesapDoldur('emlakci@demo.com', 'Demo123!')}
                className="demo-btn"
              >
                <div className="demo-icon emlakci"><Briefcase size={14} /></div>
                <div className="demo-info">
                  <div className="demo-row"><strong>Emlakçı</strong></div>
                  <div className="demo-row"><span>E-posta:</span> emlakci@demo.com</div>
                  <div className="demo-row"><span>Şifre:</span> Demo123!</div>
                </div>
              </button>
              <button 
                onClick={() => demoHesapDoldur('user@demo.com', 'Demo123!')}
                className="demo-btn"
              >
                <div className="demo-icon user"><User size={14} /></div>
                <div className="demo-info">
                  <div className="demo-row"><strong>Kullanıcı</strong></div>
                  <div className="demo-row"><span>E-posta:</span> user@demo.com</div>
                  <div className="demo-row"><span>Şifre:</span> Demo123!</div>
                </div>
              </button>
            </div>
          </div>
      </div>
      <style>{`
        .form-sayfa-kapsayici {
          max-width: 440px;
          margin: 4rem auto;
          width: 100%;
        }

        @media (max-width: 576px) {
          .form-sayfa-kapsayici {
            margin: 1.5rem auto;
            padding: 0 1rem;
          }
          
          .cam-panel {
            padding: 1.5rem !important;
          }
        }

        .demo-btn {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .demo-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .demo-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(139, 92, 246, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }

        .demo-btn:hover::before {
          opacity: 1;
        }

        .demo-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .demo-icon.admin { 
          background: linear-gradient(135deg, #f43f5e, #9f1239);
          color: #fff;
        }
        .demo-icon.emlakci { 
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: #fff;
        }
        .demo-icon.user { 
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
        }

        .demo-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          position: relative;
          z-index: 2;
        }

        .demo-row {
          font-size: 0.75rem;
          color: var(--metin-ikincil);
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .demo-row strong {
          font-size: 1rem;
          color: #fff;
          margin-bottom: 2px;
          letter-spacing: -0.02em;
        }

        .demo-row span {
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.65rem;
          width: 50px;
        }
      `}</style>
    </div>
  );
};

export default GirisYap;
