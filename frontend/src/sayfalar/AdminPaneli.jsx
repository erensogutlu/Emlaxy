import React, { useState, useEffect } from 'react';
import { useKullanici } from '../baglam/kullanici_baglami';
import { 
  Users, 
  Home, 
  Mail, 
  BarChart3, 
  Trash2, 
  ExternalLink, 
  Search, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminPaneli = () => {
  const { kullanici, token } = useKullanici();
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState('genel-bakis');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [istatistikler, setIstatistikler] = useState(null);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [ilanlar, setIlanlar] = useState([]);
  const [mesajlar, setMesajlar] = useState([]);
  const [aramaTerimi, setAramaTerimi] = useState('');

  useEffect(() => {
    if (!kullanici || kullanici.rol !== 'admin') {
      navigate('/');
      return;
    }
    verileriGetir();
  }, [aktifSekme, kullanici, navigate]);

  const verileriGetir = async () => {
    setYukleniyor(true);
    try {
      let endpoint = '';
      if (aktifSekme === 'genel-bakis') endpoint = 'istatistikler';
      else if (aktifSekme === 'kullanicilar') endpoint = 'kullanicilar';
      else if (aktifSekme === 'ilanlar') endpoint = 'ilanlar';
      else if (aktifSekme === 'mesajlar') endpoint = 'mesajlar';

      const yanit = await fetch(`http://127.0.0.1:5000/api/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata);

      if (aktifSekme === 'genel-bakis') setIstatistikler(veri);
      else if (aktifSekme === 'kullanicilar') setKullanicilar(veri);
      else if (aktifSekme === 'ilanlar') setIlanlar(veri);
      else if (aktifSekme === 'mesajlar') setMesajlar(veri);
      
    } catch (hata) {
      toast.error('Veriler yüklenirken hata oluştu: ' + hata.message);
    } finally {
      setYukleniyor(false);
    }
  };

  const kullaniciSil = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/admin/kullanici/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (yanit.ok) {
        toast.success('Kullanıcı silindi');
        setKullanicilar(kullanicilar.filter(k => k.id !== id));
      } else {
        const veri = await yanit.json();
        toast.error(veri.hata || 'Silme hatası');
      }
    } catch (hata) {
      toast.error('İşlem başarısız');
    }
  };

  const ilanSil = async (id) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    try {
      const yanit = await fetch(`http://127.0.0.1:5000/api/admin/ilan/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (yanit.ok) {
        toast.success('İlan silindi');
        setIlanlar(ilanlar.filter(i => i.id !== id));
      } else {
        const veri = await yanit.json();
        toast.error(veri.hata || 'Silme hatası');
      }
    } catch (hata) {
      toast.error('İşlem başarısız');
    }
  };

  const filtreliKullanicilar = kullanicilar.filter(k => 
    k.ad_soyad.toLowerCase().includes(aramaTerimi.toLowerCase()) || 
    k.eposta.toLowerCase().includes(aramaTerimi.toLowerCase())
  );

  const filtreliIlanlar = ilanlar.filter(i => 
    i.baslik.toLowerCase().includes(aramaTerimi.toLowerCase()) || 
    i.konum.toLowerCase().includes(aramaTerimi.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <ShieldCheck size={28} className="text-secondary" />
          <span>Emlaxy Admin</span>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${aktifSekme === 'genel-bakis' ? 'active' : ''}`}
            onClick={() => setAktifSekme('genel-bakis')}
          >
            <BarChart3 size={20} />
            <span>Genel Bakış</span>
          </button>
          <button 
            className={`admin-nav-item ${aktifSekme === 'kullanicilar' ? 'active' : ''}`}
            onClick={() => setAktifSekme('kullanicilar')}
          >
            <Users size={20} />
            <span>Kullanıcılar</span>
          </button>
          <button 
            className={`admin-nav-item ${aktifSekme === 'ilanlar' ? 'active' : ''}`}
            onClick={() => setAktifSekme('ilanlar')}
          >
            <Home size={20} />
            <span>İlanlar</span>
          </button>
          <button 
            className={`admin-nav-item ${aktifSekme === 'mesajlar' ? 'active' : ''}`}
            onClick={() => setAktifSekme('mesajlar')}
          >
            <Mail size={20} />
            <span>Mesajlar</span>
          </button>
        </nav>

        <div className="admin-user-info">
          <div className="avatar">{kullanici?.ad_soyad?.charAt(0)}</div>
          <div className="info">
            <p className="name">{kullanici?.ad_soyad}</p>
            <p className="role">Yönetici</p>
          </div>
        </div>
      </div>

      <main className="admin-content">
        <header className="admin-header">
          <h1>{aktifSekme === 'genel-bakis' ? 'Gösterge Paneli' : 
               aktifSekme === 'kullanicilar' ? 'Kullanıcı Yönetimi' : 
               aktifSekme === 'ilanlar' ? 'İlan Yönetimi' : 'Mesajlar'}</h1>
          
          {aktifSekme !== 'genel-bakis' && (
            <div className="admin-search">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Ara..." 
                value={aramaTerimi}
                onChange={(e) => setAramaTerimi(e.target.value)}
              />
            </div>
          )}
        </header>

        {yukleniyor ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Veriler yükleniyor...</p>
          </div>
        ) : (
          <div className="admin-view animate-fade-in">
            {aktifSekme === 'genel-bakis' && istatistikler && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon users"><Users size={24} /></div>
                    <div className="stat-data">
                      <h3>{istatistikler.kullanicilar}</h3>
                      <p>Toplam Kullanıcı</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon listings"><Home size={24} /></div>
                    <div className="stat-data">
                      <h3>{istatistikler.ilanlar}</h3>
                      <p>Toplam İlan</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon messages"><Mail size={24} /></div>
                    <div className="stat-data">
                      <h3>{istatistikler.mesajlar}</h3>
                      <p>Toplam Mesaj</p>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <div className="section-header">
                    <h2>Son Eklenen İlanlar</h2>
                    <button onClick={() => setAktifSekme('ilanlar')}>Tümünü Gör</button>
                  </div>
                  <div className="activity-list">
                    {istatistikler.sonIlanlar.map(ilan => (
                      <div key={ilan.id} className="activity-item">
                        <img src={ilan.resim_url} alt={ilan.baslik} />
                        <div className="item-info">
                          <h4>{ilan.baslik}</h4>
                          <p>{ilan.konum} • {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(ilan.fiyat)}</p>
                        </div>
                        <div className="item-date">
                          <Clock size={14} />
                          {new Date(ilan.olusturma_tarihi).toLocaleDateString()}
                        </div>
                        <button className="icon-btn" onClick={() => navigate(`/ilan/${ilan.id}`)}>
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {aktifSekme === 'kullanicilar' && (
              <div className="tablo-kapsayici tablo-kapsayici-admin">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı</th>
                      <th>E-Posta</th>
                      <th>Rol</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtreliKullanicilar.map(k => (
                      <tr key={k.id}>
                        <td>
                          <div className="table-user">
                            <div className="avatar-small">{k.ad_soyad.charAt(0)}</div>
                            <span>{k.ad_soyad} {k.id === kullanici.id && '(Siz)'}</span>
                          </div>
                        </td>
                        <td>{k.eposta}</td>
                        <td>
                          <span className={`badge ${k.rol}`}>
                            {k.rol === 'admin' ? 'Yönetici' : k.rol === 'emlakci' ? 'Emlakçı' : 'Bireysel'}
                          </span>
                        </td>
                        <td>{new Date(k.kayit_tarihi).toLocaleDateString()}</td>
                        <td>
                          <div className="actions">
                            <button className="delete-btn" onClick={() => kullaniciSil(k.id)} disabled={k.id === kullanici.id}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aktifSekme === 'ilanlar' && (
              <div className="tablo-kapsayici tablo-kapsayici-admin">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>İlan</th>
                      <th>Konum</th>
                      <th>Fiyat</th>
                      <th>Ekleyen</th>
                      <th>Tarih</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtreliIlanlar.map(i => (
                      <tr key={i.id}>
                        <td>
                          <div className="table-item-main">
                            <img src={i.resim_url} alt="" className="table-img" />
                            <span>{i.baslik}</span>
                          </div>
                        </td>
                        <td>{i.konum}</td>
                        <td>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(i.fiyat)}</td>
                        <td>{i.ekleyen_ad}</td>
                        <td>{new Date(i.olusturma_tarihi).toLocaleDateString()}</td>
                        <td>
                          <div className="actions">
                            <button className="view-btn" onClick={() => navigate(`/ilan/${i.id}`)}>
                              <ExternalLink size={18} />
                            </button>
                            <button className="delete-btn" onClick={() => ilanSil(i.id)}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aktifSekme === 'mesajlar' && (
              <div className="tablo-kapsayici tablo-kapsayici-admin">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Gönderen</th>
                      <th>Alıcı</th>
                      <th>İlgili İlan</th>
                      <th>İçerik</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesajlar.map(m => (
                      <tr key={m.id}>
                        <td>{m.gonderen_ad}</td>
                        <td>{m.alici_ad}</td>
                        <td>{m.ilan_baslik || 'Genel'}</td>
                        <td className="message-cell">{m.icerik}</td>
                        <td>{new Date(m.tarih).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .admin-container {
          display: flex;
          min-height: calc(100vh - 150px);
          background: #101014;
          color: #fff;
          position: relative;
          z-index: 10;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
          margin-top: 1.5rem;
          border: 1px solid rgba(255,255,255,0.03);
          flex-direction: row;
        }

        @media (max-width: 992px) {
          .admin-container {
            flex-direction: column;
            border-radius: 0;
            margin-top: 0;
            min-height: calc(100vh - 80px);
          }
        }

        .admin-sidebar {
          width: 280px;
          background: #16161a;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
        }

        @media (max-width: 992px) {
          .admin-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding: 1rem;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          
          .admin-logo, .admin-user-info {
            display: none !important;
          }
          
          .admin-nav {
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            gap: 0.5rem;
          }
          
          .admin-nav-item {
            white-space: nowrap;
            padding: 0.6rem 1rem;
          }
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: #fff;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          text-align: left;
        }

        .admin-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .admin-nav-item.active {
          background: var(--ikincil);
          color: #fff;
          box-shadow: 0 4px 15px rgba(var(--ikincil-rgb), 0.3);
        }

        .admin-user-info {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--ikincil);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .admin-user-info .info .name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .admin-user-info .info .role {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .admin-content {
          flex: 1;
          padding: 2.5rem;
          overflow-y: auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .admin-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .admin-search {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background: #1a1a1f;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          width: 300px;
        }

        .admin-search input {
          background: transparent;
          border: none;
          color: #fff;
          width: 100%;
          outline: none;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .tablo-kapsayici-admin {
            margin: 0 -1.5rem;
            width: calc(100% + 3rem);
            border-radius: 0;
          }
          
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .admin-search {
            width: 100%;
          }
        }

        .stat-card {
          background: #16161a;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.users { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .stat-icon.listings { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-icon.messages { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .stat-data h3 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.2rem; }
        .stat-data p { color: #94a3b8; font-size: 0.9rem; }

        .recent-activity {
          background: #16161a;
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 { font-size: 1.2rem; font-weight: 700; }
        .section-header button { 
          background: transparent; 
          border: none; 
          color: var(--ikincil); 
          cursor: pointer; 
          font-weight: 600;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1rem;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .activity-item:hover { background: rgba(255,255,255,0.02); }

        .activity-item img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .item-info { flex: 1; }
        .item-info h4 { font-size: 0.95rem; margin-bottom: 0.2rem; }
        .item-info p { font-size: 0.8rem; color: #94a3b8; }

        .item-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .admin-table-container {
          background: #16161a;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          padding: 1.2rem;
          background: rgba(255,255,255,0.02);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-table td {
          padding: 1.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.95rem;
          vertical-align: middle;
        }

        .table-user, .table-item-main {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar-small {
          width: 32px;
          height: 32px;
          background: #2a2a30;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .table-img {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
        }

        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge.admin { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .badge.emlakci { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .badge.bireysel { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .actions button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn { background: rgba(255,255,255,0.05); color: #fff; }
        .delete-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .view-btn:hover { background: rgba(255,255,255,0.1); }
        .delete-btn:hover { background: #ef4444; color: #fff; }

        .message-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
        }

        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem;
          gap: 1rem;
          color: #94a3b8;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--ikincil);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminPaneli;
