import React from 'react';
import { Link } from 'react-router-dom';
import { useKarsilastirma } from '../baglam/karsilastirma_baglami';
import { useKullanici } from '../baglam/kullanici_baglami';
import { toast } from 'react-hot-toast';
import { MapPin, Maximize, Bed, Heart } from 'lucide-react';

const IlanKarti = ({ ilan, index = 0 }) => {
  const { karsilastirmaListesi, listeEkle, listeCikar } = useKarsilastirma();
  const karsilastirmadaMi = karsilastirmaListesi.some(i => i.id === ilan.id);
  
  const { kullanici, token, favoriler, favoriIslemiYap } = useKullanici();
  const favorilerimdeMi = favoriler?.includes(ilan.id);

  const karsilastirmaGecis = (e) => {
    e.preventDefault();
    if (karsilastirmadaMi) listeCikar(ilan.id);
    else listeEkle(ilan);
  };
  
  const favoriGecis = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Favorilere eklemek için giriş yapmalısınız.');
    await favoriIslemiYap(ilan.id);
  };

  // Kartlara sırayla gelme animasyonu için gecikme sınıfı
  const gecikmeSinifi = `gecikme-${(index % 3) + 1}`;

  return (
    <Link to={`/ilan/${ilan.id}`} className={`ilan-karti animasyon-asagi ${gecikmeSinifi}`} style={{ position: 'relative' }}>
      <div className="ilan-karti-resim-kapsayici">
        <img src={ilan.resim_url ? ilan.resim_url.split(',')[0].trim() : 'https://placehold.co/800x600/18181b/8b5cf6?text=Emlaxy+İlan'} alt={ilan.baslik} className="ilan-karti-resim" />
        <div className="ilan-karti-etiket-overlay">
          <span className={`etiket ${ilan.islem_tipi === 'satilik' ? 'etiket-yakut' : 'etiket-zumrut'}`}>
            {ilan.islem_tipi === 'satilik' ? 'Satılık' : 'Kiralık'}
          </span>
        </div>
        <button 
          onClick={favoriGecis}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'white', border: 'none', borderRadius: '50%',
            width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10
          }}
          title="Favorilere Ekle"
        >
          <Heart size={20} color={favorilerimdeMi ? 'red' : 'gray'} fill={favorilerimdeMi ? 'red' : 'none'} />
        </button>
      </div>
      <div className="ilan-karti-icerik">
        <h3 className="ilan-karti-baslik">{ilan.baslik}</h3>
        
        <div className="ilan-karti-fiyat">
          {Number(ilan.fiyat).toLocaleString('tr-TR')} ₺
        </div>
        
        <div className="ilan-karti-ozellikler">
          <div className="ilan-karti-ozellik">
            <Bed size={15} /> <span>{ilan.oda_sayisi || 'Bilinmiyor'}</span>
          </div>
          <div className="ilan-karti-ozellik">
            <Maximize size={15} /> <span>{ilan.metrekare} m²</span>
          </div>
          <div className="ilan-karti-ozellik" style={{ width: '100%', marginTop: '0.2rem' }}>
            <MapPin size={15} /> <span>{ilan.konum}</span>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--panel-kenarlik)' }}>
          <button 
            className={`btn ${karsilastirmadaMi ? 'btn-birincil' : 'btn-ikincil'}`} 
            style={{ width: '100%' }}
            onClick={karsilastirmaGecis}
          >
            {karsilastirmadaMi ? 'Karşılaştırmadan Çıkar' : 'Karşılaştır'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default IlanKarti;
