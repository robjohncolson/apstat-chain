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
    // ARRANGE: Set up the test scenario with empty blockchain (just Genesis block)
    
    // Create an ACTIVITY_COMPLETE transaction for lessonId '1-2' signed by userA
    const activityCompleteTransactionA: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',
      activityId: '1-2_quiz',
      contribution: 0.5
    });

    // Create another ACTIVITY_COMPLETE transaction for lessonId '1-2' signed by userB
    const activityCompleteTransactionB: Transaction = createTransaction(userB.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',
      activityId: '1-2_homework',
      contribution: 0.3
    });

    // Add both transactions to the service's pending transactions
    const currentPendingTransactions = service.getPendingTransactions();
    (service as any).updateState({
      pendingTransactions: [...currentPendingTransactions, activityCompleteTransactionA, activityCompleteTransactionB]
    });

    // ACT & ASSERT: Test the eligibility
    
    // UserA should be eligible because they have an ACTIVITY_COMPLETE transaction for lesson '1-2' in the mempool
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(true);

    // UserB should be eligible because they have an ACTIVITY_COMPLETE transaction for lesson '1-2' in the mempool
    const userBEligible = service.isEligibleToMine(userB.publicKey.hex);
    expect(userBEligible).toBe(true);

    // UserC should NOT be eligible because they have no activity for lesson '1-2' in the mempool
    const userC = generateKeyPair();
    const userCEligible = service.isEligibleToMine(userC.publicKey.hex);
    expect(userCEligible).toBe(false);
  });

  it('isEligibleToMine should return false when user has completed lessons but none match pending transactions', () => {
    // ARRANGE: UserA has ACTIVITY_COMPLETE for lesson '1-1' but pending transaction is for '1-2'
    
    const activityCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-1',  // Different lesson
      activityId: '1-1_quiz',
      contribution: 0.3
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithActivityComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [activityCompleteTransaction]
    );

    blockchain.addBlock(blockWithActivityComplete);

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
    // ARRANGE: UserA has ACTIVITY_COMPLETE for a lesson but no pending transactions
    
    const activityCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-2',
      activityId: '1-2_homework',
      contribution: 0.4
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithActivityComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [activityCompleteTransaction]
    );

    blockchain.addBlock(blockWithActivityComplete);

    // No pending transactions added

    // ACT & ASSERT
    const userAEligible = service.isEligibleToMine(userA.publicKey.hex);
    expect(userAEligible).toBe(false); // No pending transactions
  });

  it('isEligibleToMine should handle multiple lesson completions and pending transactions correctly', () => {
    // ARRANGE: UserA has ACTIVITY_COMPLETE transactions in confirmed blocks, multiple pending transactions exist
    
    const activityComplete1: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-1',
      activityId: '1-1_homework',
      contribution: 0.4
    });
    
    const activityComplete2: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '1-3',
      activityId: '1-3_quiz',
      contribution: 0.6
    });

    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithActivityCompletes: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [activityComplete1, activityComplete2]
    );

    blockchain.addBlock(blockWithActivityCompletes);

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
    expect(userAEligible).toBe(true); // Has ACTIVITY_COMPLETE for '1-1' which matches pending transaction
  });
}); 