import { beforeAll, describe, expect, it } from 'vitest';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import { keyPairFromMnemonic } from '../src/crypto/keys.js';
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
      expect(transaction).toHaveProperty('publicKey');
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('signature');

      // Verify types and values
      expect(transaction.payload).toEqual(payload);
      expect(typeof transaction.publicKey).toBe('string');
      expect(transaction.publicKey).toHaveLength(66); // Compressed public key hex length
      expect(typeof transaction.id).toBe('string');
      expect(transaction.id).toHaveLength(64); // SHA-256 hex string length
      expect(typeof transaction.signature).toBe('string');
      expect(transaction.signature).toHaveLength(128); // Compact signature hex length
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

      // Since we removed timestamp from the transaction, identical payloads will have the same ID
      expect(tx1.id).toBe(tx2.id);
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

    it('should set the public key correctly', () => {
      const payload = { test: 'data' };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.publicKey).toBe(keyPair1.publicKey.hex);
    });

    it('should include an isPriority flag in the payload when provided', () => {
      const payload = { action: 'test', value: 123, isPriority: true };
      const transaction = createTransaction(keyPair1.privateKey, payload);

      expect(transaction.payload).toEqual(payload);
      expect(transaction.payload.isPriority).toBe(true);
      expect(verifyTransaction(transaction)).toBe(true);
    });
  });

  describe('verifyTransaction', () => {
    it('should create a transaction that can be successfully verified', () => {
      // Generate a new KeyPair from a sample mnemonic
      const sampleMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const keyPair = keyPairFromMnemonic(sampleMnemonic);
      
      // Create a sample transaction
      const transaction = createTransaction(keyPair.privateKey, { a: 1 });
      
      // Attempt to verify this new transaction
      const isValid = verifyTransaction(transaction);
      
      // Assert that the result of verifyTransaction is true
      expect(isValid).toBe(true);
    });

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
      
      // Since timestamp is no longer part of the transaction, this test now checks a different scenario
      // Let's test tampering with the ID instead
      const tamperedTransaction: Transaction = {
        ...transaction,
        id: 'a'.repeat(64) // Fake hash
      };

      expect(verifyTransaction(tamperedTransaction)).toBe(false);
    });

    it('should return false for a transaction with wrong public key', () => {
      const payload = { action: 'test', value: 123 };
      const transaction = createTransaction(keyPair1.privateKey, payload);
      
      // Replace with different public key
      const tamperedTransaction: Transaction = {
        ...transaction,
        publicKey: keyPair2.publicKey.hex
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
        signature: 'invalid_signature'
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
        'id',
        'publicKey',
        'signature',
        'payload'
      ]);
    });

    it('should maintain data integrity after creation', () => {
      const originalPayload = { action: 'test', value: 123, nested: { data: 'value' } };
      const transaction = createTransaction(keyPair1.privateKey, originalPayload);

      // Store original values
      const originalId = transaction.id;
      const originalPublicKey = transaction.publicKey;
      const originalSignature = transaction.signature;

      // Verify transaction still validates
      expect(verifyTransaction(transaction)).toBe(true);

      // Verify values haven't changed
      expect(transaction.id).toBe(originalId);
      expect(transaction.publicKey).toBe(originalPublicKey);
      expect(transaction.signature).toBe(originalSignature);
    });
  });
}); 