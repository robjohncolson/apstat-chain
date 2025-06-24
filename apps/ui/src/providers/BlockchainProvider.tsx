import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import BlockchainService, { type BlockchainState } from '../services/BlockchainService';

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

// This is the new, correct way to use the hook.
// It returns the stable service instance and the current state.
export function useBlockchain() {
  const service = useContext(BlockchainContext);
  if (!service) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }

  // We use a React hook to subscribe to state changes from the service.
  const [state, setState] = useState<BlockchainState>(() => service.getState());

  useEffect(() => {
    const unsubscribe = service.subscribe(newState => {
      setState(newState);
    });
    // The component will re-render only when the service's state actually changes.
    return unsubscribe;
  }, [service]); // The service instance itself is the only dependency, and it never changes.

  return { service, state };
}