import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import { createTransaction } from '../src/transaction/index.js';
import { createBlock, verifyBlock, type Block } from '../src/block/index.js';
import { createAttestation } from '../src/attestation/index.js';
import type { PrivateKey, Transaction, Attestation } from '../src/types/index.js';

describe('Block', () => {
  let privateKey: PrivateKey;
  let transactions: Transaction[];
  let previousHash: string;

  beforeEach(() => {
    const keyPair = generateKeyPair();
    privateKey = keyPair.privateKey;
    
    // Create some test transactions
    transactions = [
      createTransaction(privateKey, { type: 'transfer', amount: 100, to: 'user1' }),
      createTransaction(privateKey, { type: 'transfer', amount: 50, to: 'user2' })
    ];
    
    previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  });

  describe('Block structure', () => {
    it('should have the correct structure', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('previousHash');
      expect(block).toHaveProperty('transactions');
      expect(block).toHaveProperty('timestamp');
      expect(block).toHaveProperty('signature');
      expect(block).toHaveProperty('publicKey');
      
      expect(typeof block.id).toBe('string');
      expect(typeof block.previousHash).toBe('string');
      expect(Array.isArray(block.transactions)).toBe(true);
      expect(typeof block.timestamp).toBe('number');
      expect(typeof block.signature).toBe('string');
      expect(typeof block.publicKey).toBe('string');
    });

    it('should contain the provided transactions', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(block.transactions).toEqual(transactions);
      expect(block.transactions).toHaveLength(2);
    });

    it('should contain the provided previousHash', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(block.previousHash).toBe(previousHash);
    });

    it('should have a timestamp close to current time', () => {
      const beforeTime = Date.now();
      const block = createBlock({ privateKey, previousHash, transactions });
      const afterTime = Date.now();
      
      expect(block.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(block.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should contain puzzleId and proposedAnswer when provided', () => {
      const puzzleId = 'puzzle123';
      const proposedAnswer = 'answer123';
      const block = createBlock({ 
        privateKey, 
        previousHash, 
        transactions, 
        puzzleId, 
        proposedAnswer 
      });
      
      expect(block.puzzleId).toBe(puzzleId);
      expect(block.proposedAnswer).toBe(proposedAnswer);
      expect(block.attestations).toBeUndefined(); // Should be empty/undefined in newly created block
    });

    it('should not contain puzzleId and proposedAnswer when not provided', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(block.puzzleId).toBeUndefined();
      expect(block.proposedAnswer).toBeUndefined();
      expect(block.attestations).toBeUndefined();
    });
  });

  describe('createBlock', () => {
    it('should create a valid block with correct properties', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(block.id).toBeDefined();
      expect(block.id).toMatch(/^[a-f0-9]{64}$/i); // Should be a 64-character hex string
      expect(block.previousHash).toBe(previousHash);
      expect(block.transactions).toEqual(transactions);
      expect(block.signature).toBeDefined();
      expect(block.publicKey).toBeDefined();
    });

    it('should create different blocks for different inputs', () => {
      const block1 = createBlock({ privateKey, previousHash, transactions });
      const block2 = createBlock({ privateKey, previousHash: 'different', transactions });
      
      expect(block1.id).not.toBe(block2.id);
      expect(block1.previousHash).not.toBe(block2.previousHash);
    });

    it('should handle empty transactions array', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      
      expect(block.transactions).toEqual([]);
      expect(block.id).toBeDefined();
      expect(block.signature).toBeDefined();
    });

    it('should create blocks with different timestamps when called sequentially', async () => {
      const block1 = createBlock({ privateKey, previousHash, transactions });
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const block2 = createBlock({ privateKey, previousHash, transactions });
      
      expect(block1.timestamp).not.toBe(block2.timestamp);
      expect(block1.id).not.toBe(block2.id); // Different timestamps should result in different hashes
    });

    it('should create candidate blocks with puzzle data', () => {
      const puzzleId = 'puzzle456';
      const proposedAnswer = 'answer456';
      const block = createBlock({ 
        privateKey, 
        previousHash, 
        transactions, 
        puzzleId, 
        proposedAnswer 
      });
      
      expect(block.puzzleId).toBe(puzzleId);
      expect(block.proposedAnswer).toBe(proposedAnswer);
      expect(block.id).toBeDefined();
      expect(block.signature).toBeDefined();
    });

    it('should create different block IDs when puzzle data differs', () => {
      const block1 = createBlock({ 
        privateKey, 
        previousHash, 
        transactions, 
        puzzleId: 'puzzle1', 
        proposedAnswer: 'answer1' 
      });
      const block2 = createBlock({ 
        privateKey, 
        previousHash, 
        transactions, 
        puzzleId: 'puzzle2', 
        proposedAnswer: 'answer2' 
      });
      
      expect(block1.id).not.toBe(block2.id);
      expect(block1.puzzleId).not.toBe(block2.puzzleId);
      expect(block1.proposedAnswer).not.toBe(block2.proposedAnswer);
    });
  });

  describe('verifyBlock', () => {
    it('should return true for a valid genesis block', () => {
      const genesisBlock = createBlock({ privateKey, previousHash: '0'.repeat(64), transactions: [] });
      
      expect(verifyBlock(genesisBlock)).toBe(true);
    });

    it('should return false for non-genesis blocks with transactions but no puzzle data', () => {
      const nonGenesisHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const block = createBlock({ privateKey, previousHash: nonGenesisHash, transactions });
      
      expect(verifyBlock(block)).toBe(false);
    });

    it('should return true for non-genesis blocks with no transactions', () => {
      const nonGenesisHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const block = createBlock({ privateKey, previousHash: nonGenesisHash, transactions: [] });
      
      expect(verifyBlock(block)).toBe(true);
    });

    it('should return true for a valid block with valid attestations', () => {
      const nonGenesisHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const puzzleId = 'puzzle123';
      const proposedAnswer = 'answer123';
      
      // Create attestations from other peers
      const attester1 = generateKeyPair();
      const attester2 = generateKeyPair();
      const attestations: Attestation[] = [
        createAttestation({ privateKey: attester1.privateKey, puzzleId, proposedAnswer }),
        createAttestation({ privateKey: attester2.privateKey, puzzleId, proposedAnswer })
      ];
      
      // Create the block with puzzle data
      const candidateBlock = createBlock({ 
        privateKey, 
        previousHash: nonGenesisHash, 
        transactions, 
        puzzleId, 
        proposedAnswer 
      });
      
      // Add attestations to create final block
      const finalBlock: Block = {
        ...candidateBlock,
        attestations
      };
      
      expect(verifyBlock(finalBlock)).toBe(true);
    });

    it('should return false if any attestation is invalid', () => {
      const nonGenesisHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const puzzleId = 'puzzle123';
      const proposedAnswer = 'answer123';
      
      // Create one valid and one invalid attestation
      const attester1 = generateKeyPair();
      const validAttestation = createAttestation({ privateKey: attester1.privateKey, puzzleId, proposedAnswer });
      const invalidAttestation: Attestation = {
        ...validAttestation,
        signature: 'invalid_signature'
      };
      
      const candidateBlock = createBlock({ 
        privateKey, 
        previousHash: nonGenesisHash, 
        transactions, 
        puzzleId, 
        proposedAnswer 
      });
      
      const finalBlock: Block = {
        ...candidateBlock,
        attestations: [validAttestation, invalidAttestation]
      };
      
      expect(verifyBlock(finalBlock)).toBe(false);
    });

    it('should return false if attestations do not match block puzzle data', () => {
      const nonGenesisHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const puzzleId = 'puzzle123';
      const proposedAnswer = 'answer123';
      
      // Create attestation for different puzzle data
      const attester1 = generateKeyPair();
      const mismatchedAttestation = createAttestation({ 
        privateKey: attester1.privateKey, 
        puzzleId: 'different_puzzle', 
        proposedAnswer: 'different_answer' 
      });
      
      const candidateBlock = createBlock({ 
        privateKey, 
        previousHash: nonGenesisHash, 
        transactions, 
        puzzleId, 
        proposedAnswer 
      });
      
      const finalBlock: Block = {
        ...candidateBlock,
        attestations: [mismatchedAttestation]
      };
      
      expect(verifyBlock(finalBlock)).toBe(false);
    });

    it('should return false for a block with tampered id', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, id: 'tampered_id' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered signature', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, signature: 'tampered_signature' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered transactions', () => {
      const genesisBlock = createBlock({ privateKey, previousHash: '0'.repeat(64), transactions });
      const tamperedTransactions = [...transactions];
      tamperedTransactions[0] = { ...tamperedTransactions[0], payload: { tampered: true } };
      const tamperedBlock = { ...genesisBlock, transactions: tamperedTransactions };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered previousHash', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, previousHash: 'tampered_hash' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered timestamp', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, timestamp: block.timestamp + 1000 };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with invalid signature format', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, signature: 'invalid_hex' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with invalid public key format', () => {
      const block = createBlock({ privateKey, previousHash, transactions: [] });
      const tamperedBlock = { ...block, publicKey: 'invalid_hex' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });
  });
}); 