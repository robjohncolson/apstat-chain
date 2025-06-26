import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../src/chain/index.js';
import { createBlock, verifyBlock, type Block } from '../src/block/index.js';
import { createTransaction } from '../src/transaction/index.js';
import { keyPairFromMnemonic } from '../src/crypto/keys.js';
import type { PrivateKey } from '../src/types/index.js';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let testPrivateKey: PrivateKey;
  
  beforeEach(() => {
    blockchain = new Blockchain();
    // Use a consistent test mnemonic for reproducible tests
    const keyPair = keyPairFromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    testPrivateKey = keyPair.privateKey;
  });

  describe('Genesis Block', () => {
    it('should automatically contain a single Genesis Block when instantiated', () => {
      expect(blockchain.getChain()).toHaveLength(1);
      
      const genesisBlock = blockchain.getLatestBlock();
      expect(genesisBlock.previousHash).toBe('0'.repeat(64)); // Genesis has no previous block
      expect(genesisBlock.transactions).toEqual([]);
      expect(verifyBlock(genesisBlock)).toBe(true);
    });
  });

  describe('getLatestBlock', () => {
    it('should return the genesis block initially', () => {
      const latestBlock = blockchain.getLatestBlock();
      const chain = blockchain.getChain();
      
      expect(latestBlock).toBe(chain[chain.length - 1]);
      expect(latestBlock.previousHash).toBe('0'.repeat(64));
    });

    it('should return the most recently added block', () => {
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const newBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      blockchain.addBlock(newBlock);
      
      const latestBlock = blockchain.getLatestBlock();
      expect(latestBlock).toBe(newBlock);
      expect(latestBlock.transactions).toContain(transaction);
    });
  });

  describe('addBlock', () => {
    it('should successfully add a valid block', () => {
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const newBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      expect(() => blockchain.addBlock(newBlock)).not.toThrow();
      expect(blockchain.getChain()).toHaveLength(2);
      expect(blockchain.getLatestBlock()).toBe(newBlock);
    });

    it('should throw an error if the block has an invalid signature', () => {
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      // Create an invalid block by corrupting the signature
      const invalidBlock: Block = {
        ...validBlock,
        signature: 'invalid_signature'
      };

      expect(() => blockchain.addBlock(invalidBlock)).toThrow('Invalid block signature');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });

    it('should throw an error if previousHash does not match the latest block hash', () => {
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const invalidBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: 'wrong_hash',
        transactions: [transaction]
      });

      expect(() => blockchain.addBlock(invalidBlock)).toThrow('Previous hash does not match');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });

    it('should throw an error if the block contains invalid transactions', () => {
      // Create a transaction with corrupted signature
      const validTransaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const invalidTransaction = {
        ...validTransaction,
        signature: 'invalid_signature'
      };

      const invalidBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [invalidTransaction]
      });

      expect(() => blockchain.addBlock(invalidBlock)).toThrow('Block contains invalid transactions');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });
  });

  describe('isValidChain', () => {
    it('should return true for a valid chain with only genesis block', () => {
      const chain = blockchain.getChain();
      expect(Blockchain.isValidChain(chain)).toBe(true);
    });

    it('should return true for a valid chain with multiple blocks', () => {
      // Add a few valid blocks
      const transaction1 = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction1]
      });
      blockchain.addBlock(block1);

      const transaction2 = createTransaction(testPrivateKey, { type: 'test', data: 'block2' });
      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction2]
      });
      blockchain.addBlock(block2);

      const chain = blockchain.getChain();
      expect(Blockchain.isValidChain(chain)).toBe(true);
    });

    it('should return false for an empty chain', () => {
      expect(Blockchain.isValidChain([])).toBe(false);
    });

    it('should return false for a chain with an invalid genesis block', () => {
      const invalidGenesis: Block = {
        id: 'invalid',
        previousHash: 'wrong_hash',
        transactions: [],
        timestamp: Date.now(),
        signature: 'invalid',
        publicKey: 'invalid'
      };

      expect(Blockchain.isValidChain([invalidGenesis])).toBe(false);
    });

    it('should return false for a chain where previousHash links are broken', () => {
      // Create a valid first block
      const transaction1 = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction1]
      });

      // Create a second block with wrong previousHash
      const transaction2 = createTransaction(testPrivateKey, { type: 'test', data: 'block2' });
      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: 'wrong_hash', // This should be block1.id
        transactions: [transaction2]
      });

      const invalidChain = [blockchain.getLatestBlock(), block1, block2];
      expect(Blockchain.isValidChain(invalidChain)).toBe(false);
    });

    it('should return false for a chain containing blocks with invalid signatures', () => {
      // Create a valid block first
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      // Corrupt the signature
      const invalidBlock: Block = {
        ...validBlock,
        signature: 'corrupted_signature'
      };

      const invalidChain = [blockchain.getLatestBlock(), invalidBlock];
      expect(Blockchain.isValidChain(invalidChain)).toBe(false);
    });
  });

  describe('replaceChain', () => {
    it('should replace the chain and return true when newChain is valid and longer', () => {
      const originalChain = blockchain.getChain();
      expect(originalChain).toHaveLength(1); // Only genesis block

      // Create a longer valid chain
      const transaction1 = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction1]
      });

      const transaction2 = createTransaction(testPrivateKey, { type: 'test', data: 'block2' });
      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: block1.id,
        transactions: [transaction2]
      });

      const newChain = [originalChain[0], block1, block2]; // Include genesis + 2 new blocks
      
      const result = blockchain.replaceChain(newChain);
      
      expect(result).toBe(true);
      expect(blockchain.getChain()).toHaveLength(3);
      expect(blockchain.getLatestBlock()).toBe(block2);
    });

    it('should return false and not replace the chain when newChain is shorter', () => {
      // First add a block to make the current chain longer
      const transaction1 = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction1]
      });
      blockchain.addBlock(block1);

      const originalChain = blockchain.getChain();
      expect(originalChain).toHaveLength(2);

      // Create a shorter chain (just genesis block)
      const shorterChain = [originalChain[0]];
      
      const result = blockchain.replaceChain(shorterChain);
      
      expect(result).toBe(false);
      expect(blockchain.getChain()).toHaveLength(2); // Should remain unchanged
      expect(blockchain.getLatestBlock()).toBe(block1);
    });

    it('should return false and not replace the chain when newChain is invalid', () => {
      const originalChain = blockchain.getChain();
      
      // Create an invalid chain with corrupted block signature
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'block1' });
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      const invalidBlock: Block = {
        ...validBlock,
        signature: 'corrupted_signature'
      };

      const invalidChain = [originalChain[0], invalidBlock];
      
      const result = blockchain.replaceChain(invalidChain);
      
      expect(result).toBe(false);
      expect(blockchain.getChain()).toHaveLength(1); // Should remain unchanged (only genesis)
      expect(blockchain.getLatestBlock()).toBe(originalChain[0]);
    });
  });
}); 