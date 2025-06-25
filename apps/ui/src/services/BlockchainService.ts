import {
    createTransaction,
    generateMnemonic,
    keyPairFromMnemonic,
    verifyTransaction,
    type KeyPair,
    type Transaction
} from '@apstat-chain/core';
import { P2PNode, discoverPeers } from '@apstat-chain/p2p';

export interface BlockchainState {
  isInitialized: boolean;
  currentKeyPair: KeyPair | null;
  mnemonic: string | null;
  p2pNode: P2PNode | null;
  peerId: string | null;
  connectedPeers: string[];
  transactions: Transaction[];
  isConnecting: boolean;
  error: string | null;
}

export type BlockchainStateListener = (state: BlockchainState) => void;

class BlockchainService {
  private static instance: BlockchainService;
  private state: BlockchainState;
  private listeners: Set<BlockchainStateListener> = new Set();

  private constructor() {
    this.state = {
      isInitialized: false,
      currentKeyPair: null,
      mnemonic: null,
      p2pNode: null,
      peerId: null,
      connectedPeers: [],
      transactions: [],
      isConnecting: false,
      error: null,
    };
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  public subscribe(listener: BlockchainStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateState(updates: Partial<BlockchainState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // Key Management
  public async generateNewWallet(): Promise<{ mnemonic: string; keyPair: KeyPair }> {
    try {
      const mnemonic = generateMnemonic();
      const keyPair = await keyPairFromMnemonic(mnemonic);
      
      this.updateState({
        currentKeyPair: keyPair,
        mnemonic,
        error: null,
      });

      return { mnemonic, keyPair };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallet';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  public async restoreWallet(mnemonic: string): Promise<KeyPair> {
    try {
      const keyPair = await keyPairFromMnemonic(mnemonic);
      
      this.updateState({
        currentKeyPair: keyPair,
        mnemonic,
        isInitialized: true,
        error: null,
      });

      return keyPair;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore wallet';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  public getCurrentKeyPair(): KeyPair | null {
    return this.state.currentKeyPair;
  }

  public getMnemonic(): string | null {
    return this.state.mnemonic;
  }

  // Transaction Management
  public createTransaction(payload: any): Transaction {
    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    try {
      const transaction = createTransaction(this.state.currentKeyPair.privateKey, payload);
      
      // Add to local transactions
      this.updateState({
        transactions: [...this.state.transactions, transaction],
        error: null,
      });

      // Broadcast to connected peers if P2P is available
      if (this.state.p2pNode) {
        this.state.p2pNode.broadcastTransaction(transaction);
      }

      return transaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  public verifyTransaction(transaction: Transaction): boolean {
    return verifyTransaction(transaction);
  }

  public getTransactions(): Transaction[] {
    return this.state.transactions;
  }

  // P2P Networking
  public async initializeP2P(peerId?: string): Promise<string> {
    try {
      this.updateState({ isConnecting: true, error: null });

      const p2pNode = new P2PNode(peerId);
      
      // Set up event listeners
      p2pNode.on('ready', (id: string) => {
        this.updateState({
          p2pNode,
          peerId: id,
          isConnecting: false,
          error: null,
        });
      });

      p2pNode.on('peer:connected', (peer: string) => {
        this.updateState({
          connectedPeers: [...new Set([...this.state.connectedPeers, peer])],
        });
      });

      p2pNode.on('peer:disconnected', (peer: string) => {
        this.updateState({
          connectedPeers: this.state.connectedPeers.filter(p => p !== peer),
        });
      });

      p2pNode.on('transaction:received', (transaction: Transaction) => {
        // Verify the transaction before adding it
        if (this.verifyTransaction(transaction)) {
          // Check if we already have this transaction
          const exists = this.state.transactions.some(tx => tx.id === transaction.id);
          if (!exists) {
            this.updateState({
              transactions: [...this.state.transactions, transaction],
            });
          }
        }
      });

      p2pNode.on('error', (error: Error) => {
        this.updateState({
          error: error.message,
          isConnecting: false,
        });
      });

      return new Promise((resolve, reject) => {
        p2pNode.once('ready', (id: string) => resolve(id));
        p2pNode.once('error', (error: Error) => reject(error));
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize P2P';
      this.updateState({ 
        error: errorMessage,
        isConnecting: false,
      });
      throw error;
    }
  }

  public async connectToPeer(peerId: string): Promise<void> {
    if (!this.state.p2pNode) {
      throw new Error('P2P node not initialized. Call initializeP2P() first.');
    }

    try {
      this.state.p2pNode.connectToPeer(peerId);
      this.updateState({ error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to peer';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  public async discoverPeers(seedDomain: string = 'peers.apstat-chain.com'): Promise<string[]> {
    try {
      const peers = await discoverPeers(seedDomain);
      return peers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to discover peers';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  public disconnectFromPeer(peerId: string): void {
    if (!this.state.p2pNode) {
      throw new Error('P2P node not initialized.');
    }

    try {
      this.state.p2pNode.disconnectFromPeer(peerId);
      this.updateState({ error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from peer';
      this.updateState({ error: errorMessage });
    }
  }

  public getConnectedPeers(): string[] {
    return this.state.connectedPeers;
  }

  public getPeerId(): string | null {
    return this.state.peerId;
  }

  // Utility Methods
  public getState(): BlockchainState {
    return { ...this.state };
  }

  public clearError(): void {
    this.updateState({ error: null });
  }

  public reset(): void {
    // Clean up P2P node if it exists
    if (this.state.p2pNode) {
      this.state.p2pNode.destroy();
    }

    this.state = {
      isInitialized: false,
      currentKeyPair: null,
      mnemonic: null,
      p2pNode: null,
      peerId: null,
      connectedPeers: [],
      transactions: [],
      isConnecting: false,
      error: null,
    };
    
    this.notify();
  }
}

export default BlockchainService; 