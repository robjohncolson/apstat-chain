import { beforeAll, describe, expect, it } from 'vitest';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import { createTransaction, verifyTransaction, type Transaction } from '../src/transaction/index.js';

describe('Transaction', () => {
  let keyPair1: any;
  let keyPair2: any;

  beforeAll(() => {
    // Generate test key pairs
    keyPair1 = generateKeyPair();
    keyPair2 = generateKeyPair();
  });

  describe('Transaction structure', () => {
    it('should create a transaction with all required fields', () => {
      const payload = { action: 'transfer', amount: 100, to: 'recipient' };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      // Verify transaction structure
      expect(transaction).toHaveProperty('payload');
      expect(transaction).toHaveProperty('timestamp');
      expect(transaction).toHaveProperty('authorPublicKey');
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('signature');

      // Verify types and values
      expect(transaction.payload).toEqual(payload);
      expect(typeof transaction.timestamp).toBe('number');
      expect(transaction.timestamp).toBeGreaterThan(0);
      expect(transaction.authorPublicKey).toEqual(keyPair1.publicKey);
      expect(typeof transaction.id).toBe('string');
      expect(transaction.id).toHaveLength(64); // SHA-256 hex string length
      expect(transaction.signature).toHaveProperty('r');
      expect(transaction.signature).toHaveProperty('s');
      expect(typeof transaction.signature.r).toBe('bigint');
      expect(typeof transaction.signature.s).toBe('bigint');
    });

    it('should generate unique IDs for different transactions', () => {
      const payload1 = { action: 'transfer', amount: 100 };
      const payload2 = { action: 'transfer', amount: 200 };

      const tx1 = createTransaction(keyPair1.privateKey, payload1);
      const tx2 = createTransaction(keyPair1.privateKey, payload2);

      expect(tx1.id).not.toBe(tx2.id);
    });

    it('should generate different IDs for same payload but different timestamps', async () => {
      const payload = { action: 'transfer', amount: 100 };

      const tx1 = createTransaction(keyPair1.privateKey, payload);
      
      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));
      
      const tx2 = createTransaction(keyPair1.privateKey, payload);

      expect(tx1.id).not.toBe(tx2.id);
      expect(tx1.timestamp).not.toBe(tx2.timestamp);
    });
  });

  describe('createTransaction', () => {
    it('should create a valid transaction with string payload', () => {
      const payload = 'Hello, blockchain!';
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.payload).toBe(payload);
      expect(verifyTransaction(transaction)).toBe(true);
    });

    it('should create a valid transaction with object payload', () => {
      const payload = {
        type: 'contract_call',
        contract: '0x123456789',
        method: 'execute',
        params: { value: 42, target: 'user123' }
      };
      
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.payload).toEqual(payload);
      expect(verifyTransaction(transaction)).toBe(true);
    });

    it('should create a valid transaction with array payload', () => {
      const payload = ['item1', 'item2', { nested: 'object' }];
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.payload).toEqual(payload);
      expect(verifyTransaction(transaction)).toBe(true);
    });

    it('should handle empty payload', () => {
      const payload = {};
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.payload).toEqual(payload);
      expect(verifyTransaction(transaction)).toBe(true);
    });

    it('should set the author public key correctly', () => {
      const payload = { test: 'data' };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.authorPublicKey).toEqual(keyPair1.publicKey);
      expect(transaction.authorPublicKey.hex).toBe(keyPair1.publicKey.hex);
    });
  });

  describe('verifyTransaction', () => {
    it('should return true for a valid transaction', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(verifyTransaction(transaction)).toBe(true);
    });

    it('should return false for a transaction with tampered payload', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Tamper with the payload
      const tamperedTransaction: Transaction = {
        ...transaction,
        payload: { action: 'test', value: 999 } // Changed value
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should return false for a transaction with tampered timestamp', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Tamper with the timestamp
      const tamperedTransaction: Transaction = {
        ...transaction,
        timestamp: transaction.timestamp + 1000
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should return false for a transaction with wrong public key', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Replace with different public key
      const tamperedTransaction: Transaction = {
        ...transaction,
        authorPublicKey: keyPair2.publicKey
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should return false for a transaction with invalid signature', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Create a different transaction to get a different signature
      const otherTransaction = createTransaction(keyPair1.privateKey, { different: 'payload' });
      
      // Use signature from other transaction
      const tamperedTransaction: Transaction = {
        ...transaction,
        signature: otherTransaction.signature
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should return false for a transaction with tampered ID', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Tamper with the ID
      const tamperedTransaction: Transaction = {
        ...transaction,
        id: 'a'.repeat(64) // Fake hash
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should handle malformed signature gracefully', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Create transaction with malformed signature
      const invalidTransaction: Transaction = {
        ...transaction,
        signature: { r: BigInt(0), s: BigInt(0) }
      };

      expect(verifyTransaction(invalidTransaction)).toBe(false);
    });
  });

  describe('Transaction immutability', () => {
    it('should create transactions that are immutable in structure', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      // Verify all properties are defined
      expect(Object.keys(transaction)).toEqual([
        'payload',
        'timestamp', 
        'authorPublicKey',
        'id',
        'signature'
      ]);
    });

    it('should maintain data integrity after creation', () => {
      const originalPayload = { action: 'test', value: 123, nested: { data: 'value' } };
      const transaction = createTransaction(keyPair1.privateKey, originalPayload);

      // Store original values
      const originalTimestamp = transaction.timestamp;
      const originalId = transaction.id;
      const originalAuthorKey = transaction.authorPublicKey.hex;
      const originalSignatureR = transaction.signature.r;

      // Verify transaction still validates
      expect(verifyTransaction(transaction)).toBe(true);

      // Verify values haven't changed
      expect(transaction.timestamp).toBe(originalTimestamp);
      expect(transaction.id).toBe(originalId);
      expect(transaction.authorPublicKey.hex).toBe(originalAuthorKey);
      expect(transaction.signature.r).toBe(originalSignatureR);
    });
  });
}); 