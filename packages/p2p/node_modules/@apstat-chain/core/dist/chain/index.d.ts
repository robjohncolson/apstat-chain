import { type Block } from '../block/index.js';
/**
 * Blockchain class that manages an ordered chain of blocks
 */
export declare class Blockchain {
    private chain;
    constructor();
    /**
     * Creates the genesis block for the blockchain
     */
    private createGenesisBlock;
    /**
     * Get the latest block in the chain
     */
    getLatestBlock(): Block;
    /**
     * Get the entire blockchain
     */
    getChain(): readonly Block[];
    /**
     * Add a new block to the chain with validation
     */
    addBlock(newBlock: Block): void;
    /**
     * Replace the current chain with a new chain if it's valid and longer
     * @param newChain The new chain to potentially replace the current one
     * @returns true if the chain was replaced, false otherwise
     */
    replaceChain(newChain: readonly Block[]): boolean;
    /**
     * Validate an entire blockchain
     */
    static isValidChain(chain: readonly Block[]): boolean;
}
//# sourceMappingURL=index.d.ts.map