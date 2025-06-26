import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import { createTransaction } from '../src/transaction/index.js';
import { createBlock, verifyBlock, type Block } from '../src/block/index.js';
import type { PrivateKey, Transaction } from '../src/types/index.js';

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
  });

  describe('verifyBlock', () => {
    it('should return true for a valid block', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      
      expect(verifyBlock(block)).toBe(true);
    });

    it('should return false for a block with tampered id', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, id: 'tampered_id' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered signature', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, signature: 'tampered_signature' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered transactions', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedTransactions = [...transactions];
      tamperedTransactions[0] = { ...tamperedTransactions[0], payload: { tampered: true } };
      const tamperedBlock = { ...block, transactions: tamperedTransactions };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered previousHash', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, previousHash: 'tampered_hash' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with tampered timestamp', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, timestamp: block.timestamp + 1000 };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with invalid signature format', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, signature: 'invalid_hex' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });

    it('should return false for a block with invalid public key format', () => {
      const block = createBlock({ privateKey, previousHash, transactions });
      const tamperedBlock = { ...block, publicKey: 'invalid_hex' };
      
      expect(verifyBlock(tamperedBlock)).toBe(false);
    });
  });
}); 