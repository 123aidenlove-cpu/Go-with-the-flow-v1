import React, { createContext, useContext, useState, useEffect } from 'react';

type InstrumentType = 
  | 'Clarinet' 
  | 'Trumpet' 
  | 'Flute' 
  | 'Alto Saxophone' 
  | 'Tenor Saxophone' 
  | 'Trombone' 
  | 'French Horn' 
  | 'Baritone/Euphonium'
  | 'Tuba'
  | 'Violin'
  | 'Viola'
  | 'Cello'
  | 'Double Bass'
  | 'Oboe'
  | 'Mallet Percussion';

interface InstrumentContextType {
  instrument: InstrumentType;
  setInstrument: (inst: InstrumentType) => void;
}

const InstrumentContext = createContext<InstrumentContextType | undefined>(undefined);

export const InstrumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instrument, setInstrumentState] = useState<InstrumentType>('Trumpet'); // Default for now since we just tested Trumpet

  useEffect(() => {
    const saved = localStorage.getItem('selected_instrument') as InstrumentType;
    if (saved) {
      setInstrumentState(saved);
    }
  }, []);

  const setInstrument = (inst: InstrumentType) => {
    setInstrumentState(inst);
    localStorage.setItem('selected_instrument', inst);
  };

  return (
    <InstrumentContext.Provider value={{ instrument, setInstrument }}>
      {children}
    </InstrumentContext.Provider>
  );
};

export const useInstrument = () => {
  const context = useContext(InstrumentContext);
  if (!context) {
    throw new Error('useInstrument must be used within an InstrumentProvider');
  }
  return context;
};
