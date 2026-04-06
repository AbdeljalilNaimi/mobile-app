import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface NetworkStatusContextType {
  isOnline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({ isOnline: true });

export const NetworkStatusProvider = ({ children }: { children: ReactNode }) => {
  const { isOnline } = useNetworkStatus();

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatusContext = () => useContext(NetworkStatusContext);
