import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateKeyPair, 
  createTransaction, 
  createBlock, 
  createAttestation,
  Blockchain,
  type KeyPair,
  type Transaction,
  type Block,
  type Attestation,
  type PrivateKey
} from '@apstat-chain/core';
import BlockchainService from './BlockchainService';

describe('BlockchainService - Mining Eligibility', () => {
  let service: BlockchainService;
  let userA: KeyPair;
  let userB: KeyPair;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (BlockchainService as any).instance = undefined;
    service = BlockchainService.getInstance();
    
    // Generate test keypairs
    userA = generateKeyPair();
    userB = generateKeyPair();
  });

  // Helper function to create a valid block with transactions and attestations
  function createValidBlockWithTransactions(privateKey: PrivateKey, previousHash: string, transactions: Transaction[]): Block {
    const puzzleId = 'test-puzzle-123';
    const proposedAnswer = 'test-answer-123';
    
    // Create attestations from different peers
    const attester1 = generateKeyPair();
    const attester2 = generateKeyPair();
    const attestations: Attestation[] = [
      createAttestation({ privateKey: attester1.privateKey, puzzleId, proposedAnswer }),
      createAttestation({ privateKey: attester2.privateKey, puzzleId, proposedAnswer })
    ];
    
    // Create candidate block
    const candidateBlock = createBlock({
      privateKey,
      previousHash,
      transactions,
      puzzleId,
      proposedAnswer
    });
    
    // Return final block with attestations
    return {
      ...candidateBlock,
      attestations
    };
  }

  it('isEligibleToMine should return true only for users who have completed a relevant lesson', () => {
    // ARRANGE: Set up the test scenario
    
    // Create a LESSON_COMPLETE transaction for lessonId '1-2' signed by userA
    const lessonCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'LESSON_COMPLETE',
      lessonId: '1-2'
    });

    // Add this transaction to a block on the service's blockchain
    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithLessonComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [lessonCompleteTransaction]
    );

    // Add the block to the blockchain
    blockchain.addBlock(blockWithLessonComplete);

    // Create a pending transaction for lessonId '1-2' (simulating a student's quiz completion)
    const pendingTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',
      activityId: '1-2_quiz',
      contribution: 0.5
    });

    // Add this to the service's pending transactions
    const currentPendingTransactions = service.getPendingTransactions();
    (service as any).updateState({
      pendingTransactions: [...currentPendingTransactions, pendingTransaction]
    });

    // ACT & ASSERT: Test the eligibility
    
    // UserA should be eligible because they have completed lesson '1-2' and there's a pending transaction for '1-2'
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(true);

    // UserB should NOT be eligible because they have no on-chain history of completing lesson '1-2'
    const userBEligible = service.isEligibleToMine(userB.publicKey.hex);
    expect(userBEligible).toBe(false);
  });

  it('isEligibleToMine should return false when user has completed lessons but none match pending transactions', () => {
    // ARRANGE: UserA completes lesson '1-1' but pending transaction is for '1-2'
    
    const lessonCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'LESSON_COMPLETE',
      lessonId: '1-1'  // Different lesson
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithLessonComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [lessonCompleteTransaction]
    );

    blockchain.addBlock(blockWithLessonComplete);

    // Create pending transaction for different lesson
    const pendingTransaction: Transaction = createTransaction(userB.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',  // Different lesson ID
      activityId: '1-2_quiz',
      contribution: 0.5
    });

    const currentPendingTransactions = service.getPendingTransactions();
    (service as any).updateState({
      pendingTransactions: [...currentPendingTransactions, pendingTransaction]
    });

    // ACT & ASSERT
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(false); // No matching lesson
  });

  it('isEligibleToMine should return false when no pending transactions exist', () => {
    // ARRANGE: UserA completes a lesson but no pending transactions
    
    const lessonCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'LESSON_COMPLETE',
      lessonId: '1-2'
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithLessonComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [lessonCompleteTransaction]
    );

    blockchain.addBlock(blockWithLessonComplete);

    // No pending transactions added

    // ACT & ASSERT
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(false); // No pending transactions
  });

  it('isEligibleToMine should handle multiple lesson completions and pending transactions correctly', () => {
    // ARRANGE: UserA completes multiple lessons, multiple pending transactions exist
    
    const lessonComplete1: Transaction = createTransaction(userA.privateKey, {
      type: 'LESSON_COMPLETE',
      lessonId: '1-1'
    });
    
    const lessonComplete2: Transaction = createTransaction(userA.privateKey, {
      type: 'LESSON_COMPLETE',
      lessonId: '1-3'
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithLessonCompletes: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [lessonComplete1, lessonComplete2]
    );

    blockchain.addBlock(blockWithLessonCompletes);

    // Add multiple pending transactions
    const pendingTransaction1: Transaction = createTransaction(userB.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-1',  // Matches userA's completion
      activityId: '1-1_quiz',
      contribution: 0.3
    });

    const pendingTransaction2: Transaction = createTransaction(userB.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',  // Does NOT match userA's completions
      activityId: '1-2_quiz',
      contribution: 0.4
    });

    const currentPendingTransactions = service.getPendingTransactions();
    (service as any).updateState({
      pendingTransactions: [...currentPendingTransactions, pendingTransaction1, pendingTransaction2]
    });

    // ACT & ASSERT
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(true); // Has completed '1-1' which matches pending transaction
  });
}); 