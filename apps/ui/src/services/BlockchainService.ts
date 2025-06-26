import {
    createTransaction,
    generateMnemonic,
    keyPairFromMnemonic,
    verifyTransaction,
    Blockchain,
    createBlock,
    verifyBlock,
    type KeyPair,
    type Transaction,
    type Block
} from '@apstat-chain/core';
import { P2PNode, discoverPeers } from '@apstat-chain/p2p';

export interface BlockchainState {
  isInitialized: boolean;
  currentKeyPair: KeyPair | null;
  mnemonic: string | null;
  p2pNode: P2PNode | null;
  peerId: string | null;
  connectedPeers: string[];
  blockchain: Blockchain;
  pendingTransactions: Transaction[];
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
      blockchain: new Blockchain(),
      pendingTransactions: [],
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
    this.state = Object.assign({}, this.state, updates);
    this.notify();
  }

  // Key Management
  public async generateNewWallet(): Promise<{ mnemonic: string; keyPair: KeyPair }> {
    const mnemonic = generateMnemonic();
    const keyPair = await keyPairFromMnemonic(mnemonic);
    
    return { mnemonic, keyPair };
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
      
      // Add to pending transactions instead of directly to blockchain
      this.updateState({
        pendingTransactions: [...this.state.pendingTransactions, transaction],
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
    // Return all transactions from all blocks in the blockchain
    const allTransactions: Transaction[] = [];
    for (const block of this.state.blockchain.getChain()) {
      allTransactions.push(...block.transactions);
    }
    return allTransactions;
  }

  public getPendingTransactions(): Transaction[] {
    return this.state.pendingTransactions;
  }

  public getBlockchain(): Blockchain {
    return this.state.blockchain;
  }

  /**
   * Mine all pending transactions into a new block and add it to the blockchain
   */
  public minePendingTransactions(): void {
    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    if (this.state.pendingTransactions.length === 0) {
      throw new Error('No pending transactions to mine');
    }

    try {
      const latestBlock = this.state.blockchain.getLatestBlock();
      const newBlock = createBlock({
        privateKey: this.state.currentKeyPair.privateKey,
        previousHash: latestBlock.id,
        transactions: [...this.state.pendingTransactions]
      });

      this.state.blockchain.addBlock(newBlock);

      // Broadcast the new block to connected peers if P2P is available
      if (this.state.p2pNode) {
        this.state.p2pNode.broadcastBlock(newBlock);
      }

      // Clear pending transactions after successful mining
      this.updateState({
        pendingTransactions: [],
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mine pending transactions';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  // P2P Networking
  public async initializeP2P(keyPair: KeyPair): Promise<string> {
    try {
      this.updateState({ isConnecting: true, error: null });

      const p2pNode = new P2PNode(keyPair, {
        host: import.meta.env.VITE_PEERJS_SERVER_HOST,
        port: parseInt(import.meta.env.VITE_PEERJS_SERVER_PORT, 10),
        path: import.meta.env.VITE_PEERJS_SERVER_PATH,
      });
      
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
          // Check if we already have this transaction in pending or in blocks
          const existsInPending = this.state.pendingTransactions.some(tx => tx.id === transaction.id);
          const existsInBlocks = this.getTransactions().some(tx => tx.id === transaction.id);
          
          if (!existsInPending && !existsInBlocks) {
            this.updateState({
              pendingTransactions: [...this.state.pendingTransactions, transaction],
            });
          }
        } else {
          console.warn('Received and discarded invalid transaction:', transaction);
        }
      });

      p2pNode.on('block:received', (block: Block, senderPeerId: string) => {
        try {
          // Verify the block before attempting to add it
          if (verifyBlock(block)) {
            // Check if we already have this block
            const currentChain = this.state.blockchain.getChain();
            const blockExists = currentChain.some(existingBlock => existingBlock.id === block.id);
            
            if (!blockExists) {
              // Attempt to add the block to the local blockchain
              this.state.blockchain.addBlock(block);
              
              // Remove any transactions from pending that are now in this block
              const blockTransactionIds = new Set(block.transactions.map(tx => tx.id));
              const updatedPendingTransactions = this.state.pendingTransactions.filter(
                tx => !blockTransactionIds.has(tx.id)
              );
              
              this.updateState({
                pendingTransactions: updatedPendingTransactions,
              });
              
              console.log(`Successfully added received block ${block.id} to local blockchain`);
            } else {
              console.log(`Block ${block.id} already exists in local blockchain`);
            }
          } else {
            console.warn('Received and discarded invalid block:', block.id);
          }
        } catch (error) {
          console.error('Error handling received block:', error);
          // Check if this is a chain synchronization issue (e.g., previous hash doesn't match)
          if (error instanceof Error && error.message.includes('Previous hash does not match')) {
            console.log('Chain synchronization issue detected, requesting full chain from sender');
            this.state.p2pNode?.requestChain(senderPeerId);
          }
          // Gracefully handle errors - don't crash the application
        }
      });

      p2pNode.on('chain-request:received', (requesterId: string) => {
        console.log(`Received chain request from peer ${requesterId}`);
        // Send our current chain to the requesting peer
        this.state.p2pNode?.sendChain(requesterId, this.state.blockchain.getChain());
      });

      p2pNode.on('chain:received', (receivedChain: Block[]) => {
        console.log('Received full chain from peer, attempting to replace local chain');
        try {
          const result = this.state.blockchain.replaceChain(receivedChain);
          console.log('Chain replacement result:', result);
          
          // If chain was replaced successfully, update our state to reflect any changes
          if (result) {
            // Recalculate pending transactions - remove any that are now in the new chain
            const allChainTransactionIds = new Set();
            receivedChain.forEach(block => {
              block.transactions.forEach(tx => allChainTransactionIds.add(tx.id));
            });
            
            const updatedPendingTransactions = this.state.pendingTransactions.filter(
              tx => !allChainTransactionIds.has(tx.id)
            );
            
            this.updateState({
              pendingTransactions: updatedPendingTransactions,
            });
          }
        } catch (error) {
          console.error('Error replacing chain:', error);
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
      blockchain: new Blockchain(),
      pendingTransactions: [],
      isConnecting: false,
      error: null,
    };
    
    this.notify();
  }
}

export default BlockchainService; 