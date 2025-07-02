import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateKeyPair, 
  createTransaction, 
  createBlock, 
  createAttestation,
  // Blockchain, // Unused import
  type KeyPair,
  type Transaction,
  type Block,
  type Attestation,
  type PrivateKey
} from '@apstat-chain/core';
import { type Lesson } from '@apstat-chain/data';
import BlockchainService from './BlockchainService';

describe('BlockchainService - Mining Eligibility', () => {
  let service: BlockchainService;
  let userA: KeyPair;
  let userB: KeyPair;

  beforeEach(() => {
    // Clear localStorage to prevent state persistence between tests
    localStorage.clear();
    
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
    const attesterAnswer = 'test-answer-123';
    
    // Create attestations from different peers
    const attester1 = generateKeyPair();
    const attester2 = generateKeyPair();
    const attestations: Attestation[] = [
      createAttestation({ privateKey: attester1.privateKey, puzzleId, attesterAnswer }),
      createAttestation({ privateKey: attester2.privateKey, puzzleId, attesterAnswer })
    ];
    
    // Create candidate block
    const candidateBlock = createBlock({
      privateKey,
      previousHash,
      transactions,
      puzzleId,
      proposedAnswer: attesterAnswer
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

describe('BlockchainService - Attestation Eligibility', () => {
  let service: BlockchainService;
  let userA: KeyPair;
  let userB: KeyPair;

  beforeEach(() => {
    // Clear localStorage to prevent state persistence between tests
    localStorage.clear();
    
    // Reset the singleton instance for each test
    (BlockchainService as any).instance = undefined;
    service = BlockchainService.getInstance();
    
    // Generate test keypairs
    userA = generateKeyPair();
    userB = generateKeyPair();
    
    // Initialize the service with userA as the current user
    (service as any).updateState({
      currentKeyPair: userA,
      isInitialized: true
    });
  });

  // Helper function to create a valid block with transactions and attestations
  function createValidBlockWithTransactions(privateKey: PrivateKey, previousHash: string, transactions: Transaction[]): Block {
    const puzzleId = 'test-puzzle-123';
    const attesterAnswer = 'test-answer-123';
    
    // Create attestations from different peers
    const attester1 = generateKeyPair();
    const attester2 = generateKeyPair();
    const attestations: Attestation[] = [
      createAttestation({ privateKey: attester1.privateKey, puzzleId, attesterAnswer }),
      createAttestation({ privateKey: attester2.privateKey, puzzleId, attesterAnswer })
    ];
    
    // Create candidate block
    const candidateBlock = createBlock({
      privateKey,
      previousHash,
      transactions,
      puzzleId,
      proposedAnswer: attesterAnswer
    });
    
    // Return final block with attestations
    return {
      ...candidateBlock,
      attestations
    };
  }

  // Helper function to create a candidate block for testing
  function createCandidateBlockWithPuzzle(miner: KeyPair, lessonId: string): Block & { lessonId: string } {
    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const candidateBlock = createBlock({
      privateKey: miner.privateKey,
      previousHash,
      transactions: [],
      puzzleId: 'test-puzzle-for-lesson-' + lessonId,
      proposedAnswer: 'test-answer'
    });
    
    // Add lessonId to the block for testing purposes
    return {
      ...candidateBlock,
      lessonId
    };
  }

  it('should return true if the user is not the creator AND has completed the relevant lesson', () => {
    // ARRANGE: UserA has completed lesson '3-1', userB proposes a block for lesson '3-1'
    
    // Create an ACTIVITY_COMPLETE transaction for lessonId '3-1' signed by userA
    const activityCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '3-1',
      activityId: '3-1_quiz',
      contribution: 0.5
    });

    // Add the transaction to a block in the chain using the helper function
    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithActivityComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [activityCompleteTransaction]
    );

    blockchain.addBlock(blockWithActivityComplete);

    // Create a candidate block proposed by userB for a puzzle related to lessonId '3-1'
    const candidateBlock = createCandidateBlockWithPuzzle(userB, '3-1');

    // ACT & ASSERT
    const isEligible = service.isEligibleToAttest(candidateBlock);
    expect(isEligible).toBe(true);
  });

  it('should return false if the user has NOT completed the relevant lesson', () => {
    // ARRANGE: UserA has completed lesson '2-1', but the candidate block is for lesson '3-1'
    
    // Create an ACTIVITY_COMPLETE transaction for lessonId '2-1' signed by userA
    const activityCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
      type: 'ACTIVITY_COMPLETE',
      lessonId: '2-1',
      activityId: '2-1_quiz',
      contribution: 0.5
    });

    // Add the transaction to a block in the chain using the helper function
    const blockchain = service.getBlockchain();
    const previousHash = blockchain.getLatestBlock().id;
    
    const blockWithActivityComplete: Block = createValidBlockWithTransactions(
      userA.privateKey,
      previousHash,
      [activityCompleteTransaction]
    );

    blockchain.addBlock(blockWithActivityComplete);

    // Create a candidate block proposed by userB for a puzzle related to lessonId '3-1'
    const candidateBlock = createCandidateBlockWithPuzzle(userB, '3-1');

    // ACT & ASSERT
    const isEligible = service.isEligibleToAttest(candidateBlock);
    expect(isEligible).toBe(false);
  });
}); 

describe('BlockchainService - Personal Progress', () => {
  let service: BlockchainService;
  let userA: KeyPair;

  beforeEach(() => {
    // Clear localStorage to prevent state persistence between tests
    localStorage.clear();
    
    // Reset the singleton instance for each test
    (BlockchainService as any).instance = undefined;
    service = BlockchainService.getInstance();
    
    // Generate test keypair
    userA = generateKeyPair();
  });

  // Helper function to create a valid block with transactions and attestations
  function createValidBlockWithTransactions(privateKey: PrivateKey, previousHash: string, transactions: Transaction[]): Block {
    const puzzleId = 'test-puzzle-123';
    const attesterAnswer = 'test-answer-123';
    
    // Create attestations from different peers
    const attester1 = generateKeyPair();
    const attester2 = generateKeyPair();
    const attestations: Attestation[] = [
      createAttestation({ privateKey: attester1.privateKey, puzzleId, attesterAnswer }),
      createAttestation({ privateKey: attester2.privateKey, puzzleId, attesterAnswer })
    ];
    
    // Create candidate block
    const candidateBlock = createBlock({
      privateKey,
      previousHash,
      transactions,
      puzzleId,
      proposedAnswer: attesterAnswer
    });
    
    // Return final block with attestations
    return {
      ...candidateBlock,
      attestations
    };
  }

  describe('getPersonalProgress', () => {
    it('should correctly merge curriculum data with a user\'s on-chain transaction history', () => {
      // ARRANGE: Instantiate the service and create a userA
      // Add a confirmed block containing an ACTIVITY_COMPLETE transaction for activityId: '1-2_q1' signed by userA
      
      const activityCompleteTransaction: Transaction = createTransaction(userA.privateKey, {
        type: 'ACTIVITY_COMPLETE',
        lessonId: '1-2',
        activityId: '1-2_q1',
        contribution: 0.5
      });

      const blockchain = service.getBlockchain();
      const previousHash = blockchain.getLatestBlock().id;
      
      const blockWithActivityComplete: Block = createValidBlockWithTransactions(
        userA.privateKey,
        previousHash,
        [activityCompleteTransaction]
      );

      blockchain.addBlock(blockWithActivityComplete);

      // ACT: Call the new service.getPersonalProgress(userA.publicKey.hex) method
      const personalProgress = service.getPersonalProgress(userA.publicKey.hex);

      // ASSERT: Verify that the method returns a data structure representing the full curriculum
      expect(personalProgress).toBeDefined();
      expect(Array.isArray(personalProgress)).toBe(true);
      expect(personalProgress.length).toBeGreaterThan(0);

      // Find the lesson corresponding to lessonId: '1-2'
      const lesson1_2 = personalProgress.find((lesson: Lesson) => lesson.id === '1-2');
      expect(lesson1_2).toBeDefined();
      expect(lesson1_2?.activities).toBeDefined();

      // Within that lesson, find the activity corresponding to activityId: '1-2_q1'
      // Assert that this activity object now has a property completed: true
      const activity1_2_q1 = lesson1_2?.activities.find((activity: any) => activity.id === '1-2_q1');
      expect(activity1_2_q1).toBeDefined();
      expect(activity1_2_q1).toHaveProperty('completed', true);

      // Find a different activity that the user has not completed
      // Assert that its completed property is false
      const otherActivity = lesson1_2?.activities.find((activity: any) => activity.id !== '1-2_q1');
      if (otherActivity) {
        expect(otherActivity).toHaveProperty('completed', false);
      }

      // Test an activity from a different lesson to ensure it's also marked as not completed
      const lesson1_1 = personalProgress.find((lesson: Lesson) => lesson.id === '1-1');
      if (lesson1_1 && lesson1_1.activities.length > 0) {
        const activity1_1_video_1 = lesson1_1.activities[0]; // Get first activity from lesson 1-1
        expect(activity1_1_video_1).toHaveProperty('completed', false);
      }
    });
  });
}); 