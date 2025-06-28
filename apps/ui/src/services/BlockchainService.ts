import {
    createTransaction,
    generateMnemonic,
    keyPairFromMnemonic,
    verifyTransaction,
    Blockchain,
    createBlock,
    verifyBlock,
    createAttestation,
    verifyAttestation,
    type KeyPair,
    type Transaction,
    type Block,
    type Attestation
} from '@apstat-chain/core';
import { P2PNode, discoverPeers } from '@apstat-chain/p2p';
import { ALL_QUESTIONS, type QuizQuestion } from '@apstat-chain/data';

export interface BlockchainState {
  isInitialized: boolean;
  currentKeyPair: KeyPair | null;
  mnemonic: string | null;
  p2pNode: P2PNode | null;
  peerId: string | null;
  connectedPeers: string[];
  blockchain: Blockchain;
  pendingTransactions: Transaction[];
  candidateBlocks: Map<string, Block>;
  isConnecting: boolean;
  error: string | null;
  allTransactions: Transaction[];
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
      candidateBlocks: new Map(),
      isConnecting: false,
      error: null,
      allTransactions: [],
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
    // Update allTransactions whenever state changes
    const allTransactions: Transaction[] = [];
    if (updates.blockchain || this.state.blockchain) {
      const blockchain = updates.blockchain || this.state.blockchain;
      for (const block of blockchain.getChain()) {
        allTransactions.push(...block.transactions);
      }
    }
    
    this.state = { ...this.state, ...updates, allTransactions };
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
   * Check if a candidate block has enough attestations to be finalized
   */
  private _checkForBlockFinalization(candidateBlock: Block): void {
    const requiredAttestations = 3; // Define the quorum rule
    const blockAttestations = (candidateBlock as any).attestations as Attestation[] | undefined;
    
    if (!blockAttestations || blockAttestations.length < requiredAttestations) {
      return; // Not enough attestations yet
    }

    console.log(`Candidate block ${candidateBlock.id} has met finalization quorum with ${blockAttestations.length} attestations`);

    try {
      // Try to add the finalized block to the main blockchain
      this.state.blockchain.addBlock(candidateBlock);

      // Broadcast the final block to the network
      if (this.state.p2pNode) {
        this.state.p2pNode.broadcastBlock(candidateBlock);
      }

      // Remove the finalized block from candidate blocks map
      this.state.candidateBlocks.delete(candidateBlock.id);

      // Clean up confirmed transactions from pending pool
      const blockTransactionIds = new Set(candidateBlock.transactions.map(tx => tx.id));
      const updatedPendingTransactions = this.state.pendingTransactions.filter(
        tx => !blockTransactionIds.has(tx.id)
      );

      this.updateState({
        pendingTransactions: updatedPendingTransactions,
        error: null,
      });

      console.log(`Successfully finalized block ${candidateBlock.id} and added to blockchain`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to finalize block';
      console.error('Error finalizing block:', errorMessage);
      this.updateState({ error: errorMessage });
    }
  }

  /**
   * Propose a candidate block with a puzzle solution for social consensus
   */
  public proposeBlock(params: { puzzleId: string; proposedAnswer: string }): void {
    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    if (!this.state.p2pNode) {
      throw new Error('P2P node not initialized. Cannot propose block without network connection.');
    }

    if (this.state.pendingTransactions.length === 0) {
      throw new Error('No pending transactions to include in block');
    }

    try {
      const { puzzleId, proposedAnswer } = params;
      const latestBlock = this.state.blockchain.getLatestBlock();
      
      // Create a candidate block with puzzle data but empty attestations
      const candidateBlock = createBlock({
        privateKey: this.state.currentKeyPair.privateKey,
        previousHash: latestBlock.id,
        transactions: [...this.state.pendingTransactions],
        puzzleId,
        proposedAnswer
      } as any);

      // Add attestations property for candidate block
      (candidateBlock as any).attestations = [];

      // Add to our local candidate blocks map
      this.state.candidateBlocks.set(candidateBlock.id, candidateBlock);

      // Broadcast the candidate block to the network
      (this.state.p2pNode as any).broadcastCandidateBlock(candidateBlock);

      this.updateState({ error: null });

      console.log(`Proposed candidate block ${candidateBlock.id} for puzzle ${puzzleId} with answer ${proposedAnswer}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to propose block';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  /**
   * Submit an attestation for a candidate block
   */
  public submitAttestation(candidateBlock: Block): void {
    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    if (!this.state.p2pNode) {
      throw new Error('P2P node not initialized. Cannot submit attestation without network connection.');
    }

    const blockPuzzleId = (candidateBlock as any).puzzleId as string | undefined;
    const blockProposedAnswer = (candidateBlock as any).proposedAnswer as string | undefined;
    
    if (!blockPuzzleId || !blockProposedAnswer) {
      throw new Error('Candidate block must have puzzle data to attest to');
    }

    try {
      // Create an attestation for the candidate block's puzzle and answer
      const attestation = createAttestation({
        privateKey: this.state.currentKeyPair.privateKey,
        puzzleId: blockPuzzleId,
        proposedAnswer: blockProposedAnswer
      });

      // Broadcast the attestation to the network
      (this.state.p2pNode as any).broadcastAttestation(attestation);

      this.updateState({ error: null });

      console.log(`Submitted attestation for puzzle ${blockPuzzleId} in block ${candidateBlock.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit attestation';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  /**
   * Get all candidate blocks awaiting finalization
   */
  public getCandidateBlocks(): Block[] {
    return Array.from(this.state.candidateBlocks.values());
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
        
        // Request mempool from the newly connected peer
        if (this.state.p2pNode) {
          this.state.p2pNode.requestMempool(peer);
        }
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
            (this.state.p2pNode as any)?.requestChain(senderPeerId);
          }
          // Gracefully handle errors - don't crash the application
        }
      });

      p2pNode.on('chain-request:received', (requesterId: string) => {
        console.log(`Received chain request from peer ${requesterId}`);
        // Send our current chain to the requesting peer
        (this.state.p2pNode as any)?.sendChain(requesterId, this.state.blockchain.getChain());
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

      p2pNode.on('candidate-block:received', (candidateBlock: Block) => {
        const blockPuzzleId = (candidateBlock as any).puzzleId as string | undefined;
        console.log(`Received candidate block ${candidateBlock.id} for puzzle ${blockPuzzleId}`);
        
        // Verify the candidate block
        if (verifyBlock(candidateBlock)) {
          // Add to candidate blocks map
          this.state.candidateBlocks.set(candidateBlock.id, candidateBlock);
          
          // Notify state update
          this.notify();
          
          console.log(`Added candidate block ${candidateBlock.id} to pending map`);
        } else {
          console.warn('Received and discarded invalid candidate block:', candidateBlock.id);
        }
      });

      p2pNode.on('attestation:received', (attestation: Attestation) => {
        console.log(`Received attestation for puzzle ${attestation.puzzleId} from ${attestation.attesterPublicKey}`);
        
        // Verify the attestation
        if (verifyAttestation(attestation)) {
          // Find the corresponding candidate block
          const candidateBlock = Array.from(this.state.candidateBlocks.values()).find(
            block => {
              const blockPuzzleId = (block as any).puzzleId as string | undefined;
              const blockProposedAnswer = (block as any).proposedAnswer as string | undefined;
              return blockPuzzleId === attestation.puzzleId && blockProposedAnswer === attestation.proposedAnswer;
            }
          );
          
          if (candidateBlock) {
            // Check if we already have this attestation
            const blockAttestations = (candidateBlock as any).attestations as Attestation[] | undefined;
            const existingAttestation = blockAttestations?.find(
              (att: Attestation) => att.attesterPublicKey === attestation.attesterPublicKey
            );
            
            if (!existingAttestation) {
              // Add attestation to the candidate block
              const updatedBlock: Block = {
                ...candidateBlock
              };
              (updatedBlock as any).attestations = [...(blockAttestations || []), attestation];
              
              // Update the candidate block in the map
              this.state.candidateBlocks.set(candidateBlock.id, updatedBlock);
              
              // Check if block can now be finalized
              this._checkForBlockFinalization(updatedBlock);
              
              const updatedAttestations = (updatedBlock as any).attestations as Attestation[];
              console.log(`Added attestation to candidate block ${candidateBlock.id}, now has ${updatedAttestations.length} attestations`);
            } else {
              console.log(`Already have attestation from ${attestation.attesterPublicKey} for candidate block ${candidateBlock.id}`);
            }
          } else {
            console.log(`No matching candidate block found for attestation of puzzle ${attestation.puzzleId}`);
          }
        } else {
          console.warn('Received and discarded invalid attestation:', attestation);
        }
      });

      p2pNode.on('error', (error: Error) => {
        this.updateState({
          error: error.message,
          isConnecting: false,
        });
      });
      
      // Handle mempool request from other peers
      p2pNode.on('mempool-request:received', (requesterId: string) => {
        console.log(`Received mempool request from peer ${requesterId}`);
        // Send our current pending transactions to the requester
        const pendingTxs = this.getPendingTransactions();
        if (this.state.p2pNode) {
          this.state.p2pNode.sendMempool(requesterId, pendingTxs);
        }
      });

      // Handle incoming mempool from other peers
      p2pNode.on('mempool:received', (receivedTransactions: Transaction[]) => {
        console.log(`Received mempool with ${receivedTransactions.length} transactions`);
        
        // Deserialize and validate received transactions
        const validTransactions: Transaction[] = [];
        for (const txData of receivedTransactions) {
          try {
            // The transaction should already be properly formatted with signature as string
            const transaction = txData as Transaction;
            
            // Verify the transaction
            if (this.verifyTransaction(transaction)) {
              validTransactions.push(transaction);
            }
          } catch (error) {
            console.warn('Failed to deserialize or verify received transaction:', error);
          }
        }
        
        // Get current blockchain transaction IDs for deduplication
        const existingTxIds = new Set();
        
        // Add IDs from confirmed transactions (in blocks)
        for (const tx of this.getTransactions()) {
          existingTxIds.add(tx.id);
        }
        
        // Add IDs from current pending transactions
        for (const tx of this.state.pendingTransactions) {
          existingTxIds.add(tx.id);
        }
        
        // Filter out duplicates from received transactions
        const newTransactions = validTransactions.filter(tx => !existingTxIds.has(tx.id));
        
        if (newTransactions.length > 0) {
          // Merge new transactions with existing pending transactions
          const updatedPendingTransactions = [...this.state.pendingTransactions, ...newTransactions];
          
          this.updateState({
            pendingTransactions: updatedPendingTransactions,
          });
          
          console.log(`Added ${newTransactions.length} new transactions to mempool (${validTransactions.length - newTransactions.length} were duplicates)`);
        } else {
          console.log('No new transactions to add to mempool (all were duplicates)');
        }
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

  // Mining Methods
  public getMiningPuzzle(): QuizQuestion {
    // Get a random question from the imported data
    const randomIndex = Math.floor(Math.random() * ALL_QUESTIONS.length);
    return ALL_QUESTIONS[randomIndex];
  }

  // Utility Methods
  public getState(): BlockchainState {
    return { ...this.state };
  }

  /**
   * Get the total contribution value of all pending transactions
   */
  public getPendingContributionTotal(): number {
    return this.state.pendingTransactions.reduce((total, transaction) => {
      const contribution = transaction.payload?.contribution || 0;
      return total + contribution;
    }, 0);
  }

  /**
   * Check if a user is eligible to mine (placeholder implementation)
   * Complex "Relevant Knowledge" logic will be added later
   */
  public isEligibleToMine(publicKey: string): boolean {
    // Simple placeholder: eligible if there are pending transactions and key is provided
    return this.state.pendingTransactions.length > 0 && !!publicKey;
  }

  /**
   * Get all live transactions (both pending and confirmed)
   */
  public getAllTransactionsIncludingPending(): Transaction[] {
    const confirmedTransactions: Transaction[] = [];
    
    // Get all transactions from all blocks in the blockchain
    for (const block of this.state.blockchain.getChain()) {
      confirmedTransactions.push(...block.transactions);
    }
    
    // Combine confirmed transactions with pending transactions
    return [...confirmedTransactions, ...this.state.pendingTransactions];
  }

  /**
   * Get only confirmed transactions from finalized blocks in the blockchain
   */
  public getConfirmedTransactions(): Transaction[] {
    const confirmedTransactions: Transaction[] = [];
    
    // Get all transactions from all blocks in the blockchain
    for (const block of this.state.blockchain.getChain()) {
      confirmedTransactions.push(...block.transactions);
    }
    
    return confirmedTransactions;
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
      candidateBlocks: new Map(),
      isConnecting: false,
      error: null,
      allTransactions: [],
    };
    
    this.notify();
  }
}

export default BlockchainService; 