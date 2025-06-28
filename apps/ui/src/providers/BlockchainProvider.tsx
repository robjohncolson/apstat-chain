import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import BlockchainService from '../services/BlockchainService';

// The context will now hold the STABLE service instance itself.
const BlockchainContext = createContext<BlockchainService | null>(null);

// Create the single, global instance of the service OUTSIDE the component.
const blockchainServiceInstance = BlockchainService.getInstance();

interface BlockchainProviderProps {
  children: ReactNode;
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  // The only job of the provider is to expose the single service instance.
  return (
    <BlockchainContext.Provider value={blockchainServiceInstance}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const service = useContext(BlockchainContext);
  if (!service) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }

  const [state, setState] = useState(() => service.getState());

  useEffect(() => {
    const unsubscribe = service.subscribe(setState);
    // When the component unmounts, we clean up the subscription.
    return () => unsubscribe();
  }, [service]); // The effect depends only on the stable service instance.

  return { service, state };
}