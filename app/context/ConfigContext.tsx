import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
// import type { ConfigContextType } from '../../utils/config';
import { useConfig } from '../../utils/config';

type ConfigContextType = ReturnType<typeof useConfig>;

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ 
  children: ReactNode;
  init?: Parameters<typeof useConfig>[0]
}> = ({ children, init }) => {
  const config = useConfig(init);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
};

export default ConfigContext;