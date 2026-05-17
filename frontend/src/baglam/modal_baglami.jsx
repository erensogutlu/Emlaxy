import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalSaglayici = ({ children }) => {
  const [modalAyarlari, setModalAyarlari] = useState({
    acik: false,
    mesaj: '',
    onayFonksiyonu: null,
    retFonksiyonu: null,
  });

  const onayIste = useCallback((mesaj) => {
    return new Promise((resolve) => {
      setModalAyarlari({
        acik: true,
        mesaj,
        onayFonksiyonu: () => {
          setModalAyarlari((prev) => ({ ...prev, acik: false }));
          resolve(true);
        },
        retFonksiyonu: () => {
          setModalAyarlari((prev) => ({ ...prev, acik: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ onayIste }}>
      {children}
      {modalAyarlari.acik && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(5px)',
        }}>
          <div className="cam-panel" style={{
            padding: '2.5rem',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid var(--panel-kenarlik)',
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>{modalAyarlari.mesaj}</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-tehlike" 
                onClick={modalAyarlari.onayFonksiyonu}
                style={{ flex: 1 }}
              >
                Evet, Onayla
              </button>
              <button 
                className="btn btn-ikincil" 
                onClick={modalAyarlari.retFonksiyonu}
                style={{ flex: 1 }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
