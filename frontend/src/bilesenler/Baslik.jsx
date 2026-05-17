import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKullanici } from '../baglam/kullanici_baglami';
import { useKarsilastirma } from '../baglam/karsilastirma_baglami';
import { Home, LogOut, PlusSquare, BarChart2, Menu, X } from 'lucide-react';

const Baslik = () => {
  const { kullanici, cikis } = useKullanici();
  const { karsilastirmaListesi } = useKarsilastirma();
  const yonlendir = useNavigate();

  const [menuAcik, setMenuAcik] = React.useState(false);
  
  const cikisYap = () => {
    cikis();
    setMenuAcik(false);
    yonlendir('/');
  };

  const menuKapat = () => setMenuAcik(false);

  return (
    <header className="baslik">
      <div className="uygulama-kapsayici baslik-icerik">
        <Link to="/" className="logo">
          <Home className="logo-ikon" size={32} />
          Emlaxy
        </Link>
        <button className="masaustu-gizle" onClick={() => setMenuAcik(!menuAcik)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {menuAcik ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className={`navigasyon-linkleri ${menuAcik ? 'mobil-aktif' : ''}`}>
          <Link to="/" className="nav-link" onClick={menuKapat}>İlanlar</Link>
          <Link to="/karsilastir" className="nav-link" onClick={menuKapat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} />
            Karşılaştır ({karsilastirmaListesi.length})
          </Link>
          {kullanici ? (
            <>
              {(kullanici.rol === 'emlakci' || kullanici.rol === 'admin') && (
                <Link to="/ilan-ekle" className="nav-link" onClick={menuKapat}>İlan Ekle</Link>
              )}
              {kullanici.rol === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={menuKapat} style={{ color: 'var(--ikincil)', fontWeight: 'bold' }}>Admin Paneli</Link>
              )}
              <Link to="/mesajlar" className="nav-link" onClick={menuKapat}>Mesajlarım</Link>
              <Link to="/profil" className="nav-link" onClick={menuKapat}>Profilim</Link>
              <button onClick={cikisYap} className="btn btn-ikincil cikis-butonu" style={{ padding: '0.4rem 1rem' }}>Çıkış Yap</button>
            </>
          ) : (
            <Link to="/giris" className="btn btn-birincil" onClick={menuKapat}>Giriş Yap</Link>
          )}
        </nav>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .navigasyon-linkleri {
            display: flex !important;
            position: fixed;
            top: 80px;
            left: 0;
            width: 100%;
            height: 0;
            background: rgba(10, 10, 12, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 0;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border-bottom: 0 solid var(--panel-kenarlik);
            z-index: 1001;
            gap: 0;
          }

          .navigasyon-linkleri.mobil-aktif {
            height: calc(100vh - 80px);
            padding: 2rem;
            gap: 2rem;
            border-bottom-width: 1px;
          }

          .nav-link {
            font-size: 1.4rem;
            width: 100%;
            padding: 1rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          
          .nav-link::after { display: none; }

          .cikis-butonu {
            width: 100%;
            margin-top: 1rem;
            padding: 1rem !important;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Baslik;
