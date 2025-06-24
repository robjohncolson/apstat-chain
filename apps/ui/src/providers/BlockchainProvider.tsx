import type { KeyPair, Transaction } from '@apstat-chain/core';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import BlockchainService, { type BlockchainState } from '../services/BlockchainService';

interface BlockchainContextValue {
  // State
  state: BlockchainState;
  
  // Key Management
  generateNewWallet: () => Promise<{ mnemonic: string; keyPair: KeyPair }>;
  restoreWallet: (mnemonic: string) => Promise<KeyPair>;
  getCurrentKeyPair: () => KeyPair | null;
  getMnemonic: () => string | null;
  
  // Transaction Management
  createTransaction: (payload: any) => Transaction;
  verifyTransaction: (transaction: Transaction) => boolean;
  getTransactions: () => Transaction[];
  
  // P2P Networking
  initializeP2P: (peerId?: string) => Promise<string>;
  connectToPeer: (peerId: string) => Promise<void>;
  discoverPeers: (seedDomain?: string) => Promise<string[]>;
  disconnectFromPeer: (peerId: string) => void;
  getConnectedPeers: () => string[];
  getPeerId: () => string | null;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

const BlockchainContext = createContext<BlockchainContextValue | null>(null);

interface BlockchainProviderProps {
  children: ReactNode;
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  const [state, setState] = useState<BlockchainState>(() => 
    BlockchainService.getInstance().getState()
  );

  useEffect(() => {
    const service = BlockchainService.getInstance();
    
    // Subscribe to state changes
    const unsubscribe = service.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const contextValue: BlockchainContextValue = {
    state,
    
    // Key Management
    generateNewWallet: () => BlockchainService.getInstance().generateNewWallet(),
    restoreWallet: (mnemonic: string) => BlockchainService.getInstance().restoreWallet(mnemonic),
    getCurrentKeyPair: () => BlockchainService.getInstance().getCurrentKeyPair(),
    getMnemonic: () => BlockchainService.getInstance().getMnemonic(),
    
    // Transaction Management
    createTransaction: (payload: any) => BlockchainService.getInstance().createTransaction(payload),
    verifyTransaction: (transaction: Transaction) => BlockchainService.getInstance().verifyTransaction(transaction),
    getTransactions: () => BlockchainService.getInstance().getTransactions(),
    
    // P2P Networking
    initializeP2P: (peerId?: string) => BlockchainService.getInstance().initializeP2P(peerId),
    connectToPeer: (peerId: string) => BlockchainService.getInstance().connectToPeer(peerId),
    discoverPeers: (seedDomain?: string) => BlockchainService.getInstance().discoverPeers(seedDomain),
    disconnectFromPeer: (peerId: string) => BlockchainService.getInstance().disconnectFromPeer(peerId),
    getConnectedPeers: () => BlockchainService.getInstance().getConnectedPeers(),
    getPeerId: () => BlockchainService.getInstance().getPeerId(),
    
    // Utility
    clearError: () => BlockchainService.getInstance().clearError(),
    reset: () => BlockchainService.getInstance().reset(),
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain(): BlockchainContextValue {
  const context = useContext(BlockchainContext);
  
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  
  return context;
}

export default BlockchainProvider; 