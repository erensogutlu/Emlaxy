import React from 'react';
import { useKarsilastirma } from '../baglam/karsilastirma_baglami';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Karsilastirma = () => {
  const { karsilastirmaListesi, listeCikar } = useKarsilastirma();

  if (karsilastirmaListesi.length === 0) {
    return (
      <div className="cam-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Karşılaştırma Listeniz Boş</h2>
        <p style={{ marginBottom: '2rem' }}>Şu anda karşılaştırılacak hiçbir ilan bulunamadı. İlanlar sayfasından ilan ekleyebilirsiniz.</p>
        <Link to="/" className="btn btn-birincil">İlanlara Göz At</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>İlan Karşılaştırma ({karsilastirmaListesi.length}/3)</h2>
      <div className="cam-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table className="karsilastirma-tablosu">
          <thead>
            <tr>
              <th style={{ width: '200px', textAlign: 'left' }}>Özellikler</th>
              {karsilastirmaListesi.map(ilan => (
                <th key={ilan.id} style={{ minWidth: '250px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <img src={ilan.resim_url ? ilan.resim_url.split(',')[0].trim() : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} alt="ilan resmi" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    <span style={{ fontSize: '1.2rem', color: '#fff' }}>{ilan.baslik}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Fiyat</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id} style={{ color: 'var(--birincil)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {Number(ilan.fiyat).toLocaleString('tr-TR')} ₺
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Konum</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id}>{ilan.konum}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>İşlem Tipi</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id}>
                  <span className={`etiket ${ilan.islem_tipi === 'satilik' ? 'etiket-yakut' : 'etiket-zumrut'}`}>
                    {ilan.islem_tipi === 'satilik' ? 'Satılık' : 'Kiralık'}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Oda Sayısı</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id}>{ilan.oda_sayisi}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Metrekare (m²)</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id}>{ilan.metrekare} m²</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Eylemler</td>
              {karsilastirmaListesi.map(ilan => (
                <td key={ilan.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to={`/ilan/${ilan.id}`} className="btn btn-birincil" style={{ padding: '0.5rem' }}>Detayları Gör</Link>
                    <button className="btn btn-tehlike" style={{ padding: '0.5rem' }} onClick={() => listeCikar(ilan.id)}>
                      <Trash2 size={16} /> Listeden Çıkar
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Karsilastirma;
