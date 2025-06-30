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
import { ALL_QUESTIONS, ALL_LESSONS, type QuizQuestion, type Lesson } from '@apstat-chain/data';

export interface NotificationEvent {
  id: string;
  type: 'CANDIDATE_BLOCK_RECEIVED' | 'TRANSACTION_MINED' | 'ELIGIBLE_TO_MINE' | 'PEER_CONNECTED';
  timestamp: number;
  data: any;
}

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
  lastBlockMiner?: string | null;
  lastEvent: NotificationEvent | null;
  pendingActions: Set<string>;
}

export type BlockchainStateListener = (state: BlockchainState) => void;

class BlockchainService {
  private static instance: BlockchainService;
  private state: BlockchainState;
  private listeners: Set<BlockchainStateListener> = new Set();
  private static readonly MEMPOOL_STORAGE_KEY = 'apstat-mempool';

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
      lastBlockMiner: null,
      lastEvent: null,
      pendingActions: new Set(),
    };

    // Part 2: Hydrate mempool from localStorage on startup
    try {
      const storedMempool = localStorage.getItem(BlockchainService.MEMPOOL_STORAGE_KEY);
      if (storedMempool) {
        const parsedTransactions = JSON.parse(storedMempool) as Transaction[];
        const validTransactions: Transaction[] = [];
        
        // Validate every transaction from storage
        for (const transaction of parsedTransactions) {
          try {
            if (this.verifyTransaction(transaction)) {
              validTransactions.push(transaction);
            }
          } catch (error) {
            console.warn('Invalid transaction found in localStorage, skipping:', error);
          }
        }
        
        this.state.pendingTransactions = validTransactions;
      }
    } catch (error) {
      console.warn('Failed to hydrate mempool from localStorage:', error);
    }
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
    // Check mining eligibility before state update
    const wasEligibleToMine = this.state.currentKeyPair ? 
      this.isEligibleToMine(this.state.currentKeyPair.publicKey.hex) : false;
    
    // Update allTransactions whenever state changes
    const allTransactions: Transaction[] = [];
    if (updates.blockchain || this.state.blockchain) {
      const blockchain = updates.blockchain || this.state.blockchain;
      for (const block of blockchain.getChain()) {
        allTransactions.push(...block.transactions);
      }
    }
    
    this.state = { ...this.state, ...updates, allTransactions };
    
    // Check if mining eligibility changed after state update
    if (this.state.currentKeyPair && updates.pendingTransactions) {
      const isNowEligibleToMine = this.isEligibleToMine(this.state.currentKeyPair.publicKey.hex);
      
      // If user became eligible to mine, emit event
      if (!wasEligibleToMine && isNowEligibleToMine) {
        this.emitEvent('ELIGIBLE_TO_MINE', { 
          mempoolSize: this.state.pendingTransactions.length,
          contributionTotal: this.getPendingContributionTotal()
        });
      }
    }
    
    this.notify();

    // Part 1: Save mempool to localStorage when pendingTransactions change
    if (updates.pendingTransactions) {
      try {
        localStorage.setItem(
          BlockchainService.MEMPOOL_STORAGE_KEY,
          JSON.stringify(this.state.pendingTransactions)
        );
      } catch (error) {
        console.warn('Failed to save mempool to localStorage:', error);
      }
    }
  }

  private emitEvent(type: NotificationEvent['type'], data: any): void {
    const event: NotificationEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      data
    };
    
    this.updateState({ lastEvent: event });
  }

  // Loading State Management
  private setActionPending(actionId: string): void {
    const newPendingActions = new Set(this.state.pendingActions);
    newPendingActions.add(actionId);
    this.updateState({ pendingActions: newPendingActions });
  }

  private clearActionPending(actionId: string): void {
    const newPendingActions = new Set(this.state.pendingActions);
    newPendingActions.delete(actionId);
    this.updateState({ pendingActions: newPendingActions });
  }

  public isActionPending(actionId: string): boolean {
    return this.state.pendingActions.has(actionId);
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
  public createTransaction(payload: any): Transaction | null {
    // Check for duplicate ACTIVITY_COMPLETE transactions
    if (payload.type === 'ACTIVITY_COMPLETE') {
      const allTransactions = this.getAllTransactionsIncludingPending();
      const currentPublicKey = this.state.currentKeyPair?.publicKey.hex;
      
      const isDuplicate = allTransactions.some(transaction => 
        transaction.publicKey === currentPublicKey && 
        transaction.payload?.type === 'ACTIVITY_COMPLETE' &&
        transaction.payload?.activityId === payload.activityId
      );
      
      if (isDuplicate) {
        console.warn('User has already completed this activity. Transaction not created.');
        return null;
      }
    }

    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    // Create action ID for transaction
    const actionId = payload.activityId 
      ? `CREATE_TRANSACTION_${payload.activityId}` 
      : `CREATE_TRANSACTION_${Date.now()}`;

    // Check if current user should receive priority transaction reward
    let finalPayload = payload;
    let shouldClearMinerReward = false;
    
    if (this.state.currentKeyPair.publicKey.hex === this.state.lastBlockMiner) {
      finalPayload = { ...payload, isPriority: true };
      shouldClearMinerReward = true;
    }

    try {
      // Set loading state
      this.setActionPending(actionId);

      const transaction = createTransaction(this.state.currentKeyPair.privateKey, finalPayload);
      
      // Add to pending transactions and clear miner reward if applicable
      const stateUpdates: Partial<BlockchainState> = {
        pendingTransactions: [...this.state.pendingTransactions, transaction],
        error: null,
      };
      
      if (shouldClearMinerReward) {
        stateUpdates.lastBlockMiner = null;
      }
      
      this.updateState(stateUpdates);

      // Broadcast to connected peers if P2P is available
      if (this.state.p2pNode) {
        this.state.p2pNode.broadcastTransaction(transaction);
      }

      // Clear loading state on success
      this.clearActionPending(actionId);

      return transaction;
    } catch (error) {
      // Clear loading state on error
      this.clearActionPending(actionId);
      
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
   * Check if a candidate block has enough attestations to be finalized using vote counting
   */
  private _checkForBlockFinalization(candidateBlock: Block): void {
    // Calculate dynamic quorum based on online peers
    const onlinePeers = this.state.connectedPeers.length + 1;
    const quorum = Math.ceil(onlinePeers * 0.3);
    const requiredAttestations = Math.max(3, Math.min(quorum, 7));
    
    console.log(`Dynamic quorum calculated: ${requiredAttestations} required from ${onlinePeers} online peers.`);
    
    const blockAttestations = (candidateBlock as any).attestations as Attestation[] | undefined;
    
    if (!blockAttestations || blockAttestations.length < requiredAttestations) {
      return; // Not enough attestations yet
    }

    // Count votes for each answer
    const voteTally = new Map<string, number>();
    for (const attestation of blockAttestations) {
      const currentCount = voteTally.get(attestation.attesterAnswer) || 0;
      voteTally.set(attestation.attesterAnswer, currentCount + 1);
    }

    // Check if any answer has reached the quorum
    let winningAnswer: string | null = null;
    for (const [answer, voteCount] of voteTally.entries()) {
      if (voteCount >= requiredAttestations) {
        winningAnswer = answer;
        break;
      }
    }

    if (!winningAnswer) {
      console.log(`Candidate block ${candidateBlock.id} has ${blockAttestations.length} attestations but no answer has reached quorum of ${requiredAttestations}`);
      return; // No answer has reached the quorum yet
    }

    console.log(`Candidate block ${candidateBlock.id} has consensus! Answer '${winningAnswer}' won with ${voteTally.get(winningAnswer)} votes`);

    try {
      // Create a new final version of the block with the winning answer
      const finalBlock: Block = {
        ...candidateBlock,
        proposedAnswer: winningAnswer
      };

      // Try to add the finalized block to the main blockchain
      this.state.blockchain.addBlock(finalBlock);

      // Broadcast the final block to the network
      if (this.state.p2pNode) {
        this.state.p2pNode.broadcastBlock(finalBlock);
      }

      // Remove the finalized block from candidate blocks map
      const newCandidateBlocks = new Map(this.state.candidateBlocks);
      newCandidateBlocks.delete(candidateBlock.id);

      // Clean up confirmed transactions from pending pool
      const blockTransactionIds = new Set(finalBlock.transactions.map(tx => tx.id));
      const updatedPendingTransactions = this.state.pendingTransactions.filter(
        tx => !blockTransactionIds.has(tx.id)
      );

      // Check if current user has transactions in this block
      const currentUserPublicKey = this.state.currentKeyPair?.publicKey.hex;
      const userTransactionsInBlock = finalBlock.transactions.filter(
        tx => tx.publicKey === currentUserPublicKey
      );

      this.updateState({
        candidateBlocks: newCandidateBlocks,
        pendingTransactions: updatedPendingTransactions,
        lastBlockMiner: candidateBlock.publicKey,
        error: null,
      });

      // Emit transaction mined event if user has transactions in this block
      if (userTransactionsInBlock.length > 0) {
        this.emitEvent('TRANSACTION_MINED', { 
          blockId: finalBlock.id,
          transactionCount: userTransactionsInBlock.length,
          transactions: userTransactionsInBlock.map(tx => ({
            id: tx.id,
            type: tx.payload?.type,
            lessonId: tx.payload?.lessonId,
            activityId: tx.payload?.activityId
          }))
        });
      }

      console.log(`Successfully finalized block ${finalBlock.id} with winning answer '${winningAnswer}' and added to blockchain`);
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

    const actionId = `PROPOSE_BLOCK_${params.puzzleId}`;

    try {
      // Set loading state
      this.setActionPending(actionId);

      const { puzzleId, proposedAnswer } = params;
      const latestBlock = this.state.blockchain.getLatestBlock();
      
      // Sort transactions to prioritize those with isPriority flag
      const priorityTransactions = this.state.pendingTransactions.filter(tx => tx.payload?.isPriority === true);
      const regularTransactions = this.state.pendingTransactions.filter(tx => tx.payload?.isPriority !== true);
      const orderedTransactions = [...priorityTransactions, ...regularTransactions];
      
      // Create a candidate block with puzzle data but empty attestations
      const candidateBlock = createBlock({
        privateKey: this.state.currentKeyPair.privateKey,
        previousHash: latestBlock.id,
        transactions: orderedTransactions,
        puzzleId,
        proposedAnswer
      } as any);

      // Add attestations property for candidate block
      (candidateBlock as any).attestations = [];

      // Add to our local candidate blocks map
      const newCandidateBlocks = new Map(this.state.candidateBlocks);
      newCandidateBlocks.set(candidateBlock.id, candidateBlock);

      // Broadcast the candidate block to the network
      (this.state.p2pNode as any).broadcastCandidateBlock(candidateBlock);

      this.updateState({ 
        candidateBlocks: newCandidateBlocks,
        error: null 
      });

      console.log(`Proposed candidate block ${candidateBlock.id} for puzzle ${puzzleId} with answer ${proposedAnswer}`);
      
      // Clear loading state on success
      this.clearActionPending(actionId);
    } catch (error) {
      // Clear loading state on error
      this.clearActionPending(actionId);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to propose block';
      this.updateState({ error: errorMessage });
      throw error;
    }
  }

  /**
   * Submit an attestation for a candidate block with the attester's chosen answer
   */
  /**
   * Check if the current user is eligible to attest to a given block
   */
  public isEligibleToAttest(block: Block): boolean {
    // Return false if service is not initialized
    if (!this.state.isInitialized || !this.state.currentKeyPair) {
      return false;
    }

    // Return false if the current user's public key matches the block's creator public key
    if (this.state.currentKeyPair.publicKey.hex === block.publicKey) {
      return false;
    }

    // Relevant Knowledge check: Check if user has completed lessons linked to the puzzle
    const blockPuzzleId = (block as any).puzzleId as string | undefined;
    
    if (!blockPuzzleId) {
      return false;
    }

    // Check if this is a test puzzle first
    if (blockPuzzleId.startsWith('test-puzzle-for-lesson-')) {
      const testLessonId = (block as any).lessonId;
      if (testLessonId) {
        // Check if user has completed this specific lesson
        const allTransactions = this.getAllTransactionsIncludingPending();
        const currentUserPublicKey = this.state.currentKeyPair.publicKey.hex;
        
        const hasCompletedLesson = allTransactions.some(transaction => 
          transaction.publicKey === currentUserPublicKey && 
          transaction.payload?.type === 'ACTIVITY_COMPLETE' &&
          transaction.payload?.lessonId === testLessonId
        );
        
        return hasCompletedLesson;
      }
      return false;
    }

    // Find the corresponding QuizQuestion in ALL_QUESTIONS for real puzzles
    const question = ALL_QUESTIONS.find(q => q.id.toString() === blockPuzzleId);
    
    if (!question) {
      return false;
    }

    // Get the linkedLessonIds from the question
    const linkedLessonIds = question.linkedLessonIds;
    
    if (!linkedLessonIds || linkedLessonIds.length === 0) {
      return false;
    }

    // Get all of the current user's completed activities
    const allTransactions = this.getAllTransactionsIncludingPending();
    const currentUserPublicKey = this.state.currentKeyPair.publicKey.hex;
    
    // Check if the user has completed at least one lesson linked to this puzzle
    const hasCompletedRelevantLesson = allTransactions.some(transaction => 
      transaction.publicKey === currentUserPublicKey && 
      transaction.payload?.type === 'ACTIVITY_COMPLETE' &&
      linkedLessonIds.includes(transaction.payload?.lessonId)
    );

    return hasCompletedRelevantLesson;
  }

  public submitAttestation(candidateBlock: Block, attesterAnswer: string): void {
    // Guard clause: Check if user is eligible to attest to this block
    if (!this.isEligibleToAttest(candidateBlock)) {
      throw new Error('User is not eligible to attest to this block.');
    }

    if (!this.state.currentKeyPair) {
      throw new Error('No wallet initialized. Please generate or restore a wallet first.');
    }

    if (!this.state.p2pNode) {
      throw new Error('P2P node not initialized. Cannot submit attestation without network connection.');
    }

    const blockPuzzleId = (candidateBlock as any).puzzleId as string | undefined;
    
    if (!blockPuzzleId) {
      throw new Error('Candidate block must have puzzle data to attest to');
    }

    const actionId = `SUBMIT_ATTESTATION_${candidateBlock.id}`;
    
    try {
      // Set loading state
      this.setActionPending(actionId);

      // Create an attestation with the attester's chosen answer
      const attestation = createAttestation({
        privateKey: this.state.currentKeyPair.privateKey,
        puzzleId: blockPuzzleId,
        attesterAnswer: attesterAnswer
      });

      // Broadcast the attestation to the network
      (this.state.p2pNode as any).broadcastAttestation(attestation);

      this.updateState({ error: null });

      console.log(`Submitted attestation for puzzle ${blockPuzzleId} in block ${candidateBlock.id} with answer ${attesterAnswer}`);
      
      // Clear loading state on success
      this.clearActionPending(actionId);
    } catch (error) {
      // Clear loading state on error
      this.clearActionPending(actionId);
      
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

      // Provide the mempool getter to the P2P node
      p2pNode.setMempoolGetter(() => this.getPendingTransactions());
      
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
        
        // Emit peer connection event
        this.emitEvent('PEER_CONNECTED', { peerId: peer });
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
          const newCandidateBlocks = new Map(this.state.candidateBlocks);
          newCandidateBlocks.set(candidateBlock.id, candidateBlock);
          
          // Update state with new map
          this.updateState({ candidateBlocks: newCandidateBlocks });
          
          // Emit candidate block received event if user is eligible to attest
          if (this.isEligibleToAttest(candidateBlock)) {
            this.emitEvent('CANDIDATE_BLOCK_RECEIVED', { 
              blockId: candidateBlock.id, 
              puzzleId: blockPuzzleId 
            });
          }
          
          console.log(`Added candidate block ${candidateBlock.id} to pending map`);
        } else {
          console.warn('Received and discarded invalid candidate block:', candidateBlock.id);
        }
      });

      p2pNode.on('attestation:received', (attestation: Attestation) => {
        console.log(`Received attestation for puzzle ${attestation.puzzleId} from ${attestation.attesterPublicKey}`);
        
        // Verify the attestation
        if (verifyAttestation(attestation)) {
          // Find the corresponding candidate block (only match by puzzleId, not by answer)
          const candidateBlock = Array.from(this.state.candidateBlocks.values()).find(
            block => {
              const blockPuzzleId = (block as any).puzzleId as string | undefined;
              return blockPuzzleId === attestation.puzzleId;
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
              const newCandidateBlocks = new Map(this.state.candidateBlocks);
              newCandidateBlocks.set(candidateBlock.id, updatedBlock);
              
              // Update state with new map
              this.updateState({ candidateBlocks: newCandidateBlocks });
              
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
      


      // Handle incoming mempool from other peers
      p2pNode.on('mempool:received', (receivedTransactions: Transaction[]) => {
        console.log(`Received mempool with ${receivedTransactions.length} transactions`);
        
        // Create a comprehensive "seen" set of all known transaction IDs
        const confirmedTransactions = this.getConfirmedTransactions();
        const pendingTransactions = this.state.pendingTransactions;
        const allKnownTransactions = [...confirmedTransactions, ...pendingTransactions];
        const existingTxIds = new Set<string>(allKnownTransactions.map(tx => tx.id));
        
        // Filter incoming transactions to only include those we don't already know about
        const newUniqueTransactions = receivedTransactions.filter(tx => !existingTxIds.has(tx.id));
        
        // If no new transactions, log and return early
        if (newUniqueTransactions.length === 0) {
          console.log('No new transactions to add to mempool (all were duplicates)');
          return;
        }
        
        // Validate each new unique transaction
        const validNewTransactions: Transaction[] = [];
        for (const transaction of newUniqueTransactions) {
          try {
            if (this.verifyTransaction(transaction)) {
              validNewTransactions.push(transaction);
            } else {
              console.warn('Received transaction failed verification:', transaction.id);
            }
          } catch (error) {
            console.warn('Failed to verify received transaction:', error);
          }
        }
        
        // Update state with valid new transactions
        if (validNewTransactions.length > 0) {
          this.updateState({
            pendingTransactions: [...this.state.pendingTransactions, ...validNewTransactions],
          });
          
          console.log(`Added ${validNewTransactions.length} new transactions to mempool (${newUniqueTransactions.length - validNewTransactions.length} failed verification)`);
        } else {
          console.log('No valid new transactions to add to mempool');
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
   * Check if a user is eligible to mine based on the "Relevant Knowledge" rule
   * A user can mine if they have an ACTIVITY_COMPLETE transaction for a relevant lesson,
   * and that transaction exists either in a confirmed block OR in the current mempool
   */
  public isEligibleToMine(publicKey: string): boolean {
    // a. Get a list of all relevant transactions using getAllTransactionsIncludingPending()
    const allTransactions = this.getAllTransactionsIncludingPending();
    
    // b. Create a Set of all unique lessonIds from the state.pendingTransactions array
    const pendingLessonIds = new Set<string>();
    for (const transaction of this.state.pendingTransactions) {
      if (transaction.payload?.lessonId) {
        pendingLessonIds.add(transaction.payload.lessonId);
      }
    }
    
    // c. Filter the allTransactions list to find all transactions that were created by the provided publicKey 
    // and have a type of ACTIVITY_COMPLETE
    const userActivityCompletions = allTransactions.filter(transaction => 
      transaction.publicKey === publicKey && 
      transaction.payload?.type === 'ACTIVITY_COMPLETE'
    );
    
    // d. Check if any of these user-specific transactions has a lessonId that is present in the Set of pending lesson IDs
    for (const completion of userActivityCompletions) {
      if (completion.payload?.lessonId && pendingLessonIds.has(completion.payload.lessonId)) {
        return true;
      }
    }
    
    // e. Return false if no match is found
    return false;
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

    // Part 3: Clear mempool from localStorage
    try {
      localStorage.removeItem(BlockchainService.MEMPOOL_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear mempool from localStorage:', error);
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
      lastBlockMiner: null,
      lastEvent: null,
      pendingActions: new Set(),
    };
    
    this.notify();
  }

  /**
   * Get personalized progress report for a given user by merging static curriculum data 
   * with the user's confirmed transaction history
   */
  public getPersonalProgress(publicKey: string): Lesson[] {
    // Get all of the user's confirmed transactions from the blockchain
    const confirmedTransactions = this.getConfirmedTransactions();
    
    // Filter to only include ACTIVITY_COMPLETE transactions signed by the given publicKey
    const userActivityCompleteTransactions = confirmedTransactions.filter(transaction => 
      transaction.publicKey === publicKey && 
      transaction.payload?.type === 'ACTIVITY_COMPLETE'
    );

    // Create a Set containing all the activityIds from the user's completed transactions
    const completedActivityIds = new Set(
      userActivityCompleteTransactions.map(transaction => transaction.payload.activityId)
    );

    // Get the static ALL_LESSONS data and create enriched lessons
    return ALL_LESSONS.map(lesson => ({
      ...lesson,
      activities: lesson.activities.map(activity => ({
        ...activity,
        completed: completedActivityIds.has(activity.id)
      }))
    }));
  }
}

export default BlockchainService; 