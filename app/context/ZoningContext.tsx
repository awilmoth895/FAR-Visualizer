import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import useZoningCalculator from '../../utils/useZoningCalculator';

type ZoningContextType = ReturnType<typeof useZoningCalculator>;

const ZoningContext = createContext<ZoningContextType | undefined>(undefined);

export const ZoningProvider: React.FC<{ 
  children: ReactNode; 
  init?: Parameters<typeof useZoningCalculator>[0] 
}> = ({ children, init }) => {
  const zoningData = useZoningCalculator(init);

  return (
    <ZoningContext.Provider value={zoningData}>
      {children}
    </ZoningContext.Provider>
  );
};

export const useZoningContext = (): ZoningContextType => {
  const context = useContext(ZoningContext);
  if (!context) {
    throw new Error('useZoningContext must be used within a ZoningProvider');
  }
  return context;
};

export default ZoningContext;