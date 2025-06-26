import { createBlock, verifyBlock } from '../block/index.js';
import { verifyTransaction } from '../transaction/index.js';
import { keyPairFromMnemonic } from '../crypto/keys.js';
/**
 * Blockchain class that manages an ordered chain of blocks
 */
export class Blockchain {
    chain;
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }
    /**
     * Creates the genesis block for the blockchain
     */
    createGenesisBlock() {
        // Use a deterministic key pair for the genesis block
        const genesisKeyPair = keyPairFromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
        return createBlock({
            privateKey: genesisKeyPair.privateKey,
            previousHash: '0'.repeat(64), // Genesis block has no previous block
            transactions: [] // Genesis block contains no transactions
        });
    }
    /**
     * Get the latest block in the chain
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    /**
     * Get the entire blockchain
     */
    getChain() {
        return [...this.chain]; // Return a copy to prevent external mutation
    }
    /**
     * Add a new block to the chain with validation
     */
    addBlock(newBlock) {
        // Validate the block's signature and integrity
        if (!verifyBlock(newBlock)) {
            throw new Error('Invalid block signature');
        }
        // Validate that the previousHash matches the latest block's ID
        const latestBlock = this.getLatestBlock();
        if (newBlock.previousHash !== latestBlock.id) {
            throw new Error('Previous hash does not match');
        }
        // Validate all transactions in the block
        for (const transaction of newBlock.transactions) {
            if (!verifyTransaction(transaction)) {
                throw new Error('Block contains invalid transactions');
            }
        }
        // If all validations pass, add the block to the chain
        this.chain.push(newBlock);
    }
    /**
     * Replace the current chain with a new chain if it's valid and longer
     * @param newChain The new chain to potentially replace the current one
     * @returns true if the chain was replaced, false otherwise
     */
    replaceChain(newChain) {
        // Don't replace if the new chain is not longer than the current chain
        if (newChain.length <= this.chain.length) {
            return false;
        }
        // Don't replace if the new chain is not valid
        if (!Blockchain.isValidChain(newChain)) {
            return false;
        }
        // Replace the chain and return true
        this.chain = [...newChain];
        return true;
    }
    /**
     * Validate an entire blockchain
     */
    static isValidChain(chain) {
        // Chain must not be empty
        if (chain.length === 0) {
            return false;
        }
        // Validate genesis block
        const genesisBlock = chain[0];
        if (genesisBlock.previousHash !== '0'.repeat(64)) {
            return false;
        }
        // Validate each block's signature and integrity
        for (const block of chain) {
            if (!verifyBlock(block)) {
                return false;
            }
            // Validate all transactions in each block
            for (const transaction of block.transactions) {
                if (!verifyTransaction(transaction)) {
                    return false;
                }
            }
        }
        // Validate chain links (previousHash should match previous block's ID)
        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];
            if (currentBlock.previousHash !== previousBlock.id) {
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=index.js.map