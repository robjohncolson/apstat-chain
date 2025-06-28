import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../src/chain/index.js';
import { createBlock, verifyBlock, type Block } from '../src/block/index.js';
import { createTransaction } from '../src/transaction/index.js';
import { createAttestation } from '../src/attestation/index.js';
import { keyPairFromMnemonic } from '../src/crypto/keys.js';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import type { PrivateKey, Attestation } from '../src/types/index.js';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let testPrivateKey: PrivateKey;
  
  beforeEach(() => {
    blockchain = new Blockchain();
    // Use a consistent test mnemonic for reproducible tests
    const keyPair = keyPairFromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    testPrivateKey = keyPair.privateKey;
  });

  // Helper function to create a valid block with transactions, puzzle data, and attestations
  function createValidBlockWithTransactions(privateKey: PrivateKey, previousHash: string, transactionData: any[] = []): Block {
    const puzzleId = 'test-puzzle-123';
    const proposedAnswer = 'test-answer-123';
    
    // Create transactions
    const transactions = transactionData.map(data => 
      createTransaction(privateKey, data)
    );
    
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
      const newBlock = createValidBlockWithTransactions(
        testPrivateKey, 
        blockchain.getLatestBlock().id, 
        [{ type: 'test', data: 'hello' }]
      );

      blockchain.addBlock(newBlock);
      
      const latestBlock = blockchain.getLatestBlock();
      expect(latestBlock).toBe(newBlock);
      expect(latestBlock.transactions).toHaveLength(1);
    });
  });

  describe('addBlock', () => {
    it('should successfully add a valid block with no transactions', () => {
      const newBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
      });

      expect(() => blockchain.addBlock(newBlock)).not.toThrow();
      expect(blockchain.getChain()).toHaveLength(2);
      expect(blockchain.getLatestBlock()).toBe(newBlock);
    });

    it('should successfully add a valid block with transactions and attestations', () => {
      const newBlock = createValidBlockWithTransactions(
        testPrivateKey, 
        blockchain.getLatestBlock().id, 
        [{ type: 'test', data: 'hello' }]
      );

      expect(() => blockchain.addBlock(newBlock)).not.toThrow();
      expect(blockchain.getChain()).toHaveLength(2);
      expect(blockchain.getLatestBlock()).toBe(newBlock);
    });

    it('should throw an error if the block has an invalid signature', () => {
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
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
      const invalidBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: 'wrong_hash',
        transactions: []
      });

      expect(() => blockchain.addBlock(invalidBlock)).toThrow('Previous hash does not match');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });

    it('should throw an error if non-genesis block contains transactions but no puzzle data', () => {
      const transaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const invalidBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [transaction]
      });

      expect(() => blockchain.addBlock(invalidBlock)).toThrow('Invalid block signature');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });

    it('should throw an error if the block contains invalid transactions', () => {
      // Create a transaction with corrupted signature
      const validTransaction = createTransaction(testPrivateKey, { type: 'test', data: 'hello' });
      const invalidTransaction = {
        ...validTransaction,
        signature: 'invalid_signature'
      };

      // Create a block with the invalid transaction directly 
      // This will create a valid block structure but with an invalid transaction
      const puzzleId = 'test-puzzle-123';
      const proposedAnswer = 'test-answer-123';
      
      // Create attestations
      const attester1 = generateKeyPair();
      const attester2 = generateKeyPair();
      const attestations: Attestation[] = [
        createAttestation({ privateKey: attester1.privateKey, puzzleId, proposedAnswer }),
        createAttestation({ privateKey: attester2.privateKey, puzzleId, proposedAnswer })
      ];
      
      // Create the block with invalid transaction but valid structure
      const candidateBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: [invalidTransaction], // Include invalid transaction from the start
        puzzleId,
        proposedAnswer
      });
      
      const blockWithInvalidTx: Block = {
        ...candidateBlock,
        attestations
      };

      expect(() => blockchain.addBlock(blockWithInvalidTx)).toThrow('Block contains invalid transactions');
      expect(blockchain.getChain()).toHaveLength(1); // Should still only have genesis block
    });
  });

  describe('isValidChain', () => {
    it('should return true for a valid chain with only genesis block', () => {
      const chain = blockchain.getChain();
      expect(Blockchain.isValidChain(chain)).toBe(true);
    });

    it('should return true for a valid chain with multiple blocks', () => {
      // Add a few valid blocks with no transactions for simplicity
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
      });
      blockchain.addBlock(block1);

      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
      });
      blockchain.addBlock(block2);

      const chain = blockchain.getChain();
      expect(Blockchain.isValidChain(chain)).toBe(true);
    });

    it('should return true for a valid chain with transaction blocks', () => {
      // Add blocks with transactions and proper attestations
      const block1 = createValidBlockWithTransactions(
        testPrivateKey, 
        blockchain.getLatestBlock().id, 
        [{ type: 'test', data: 'block1' }]
      );
      blockchain.addBlock(block1);

      const block2 = createValidBlockWithTransactions(
        testPrivateKey, 
        blockchain.getLatestBlock().id, 
        [{ type: 'test', data: 'block2' }]
      );
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
      // Create valid blocks
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
      });

      // Create a second block with wrong previousHash
      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: 'wrong_hash', // This should be block1.id
        transactions: []
      });

      const invalidChain = [blockchain.getLatestBlock(), block1, block2];
      expect(Blockchain.isValidChain(invalidChain)).toBe(false);
    });

    it('should return false for a chain containing blocks with invalid signatures', () => {
      // Create a valid block first
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
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

      // Create a longer valid chain with empty transaction blocks
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
      });

      const block2 = createBlock({
        privateKey: testPrivateKey,
        previousHash: block1.id,
        transactions: []
      });

      const newChain = [originalChain[0], block1, block2]; // Include genesis + 2 new blocks
      
      const result = blockchain.replaceChain(newChain);
      
      expect(result).toBe(true);
      expect(blockchain.getChain()).toHaveLength(3);
      expect(blockchain.getLatestBlock()).toBe(block2);
    });

    it('should return false and not replace the chain when newChain is shorter', () => {
      // First add a block to make the current chain longer
      const block1 = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
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
      const validBlock = createBlock({
        privateKey: testPrivateKey,
        previousHash: blockchain.getLatestBlock().id,
        transactions: []
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