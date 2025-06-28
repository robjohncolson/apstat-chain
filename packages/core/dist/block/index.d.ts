import type { PrivateKey, Transaction, Block } from '../types/index.js';
export type { Block } from '../types/index.js';
/**
 * Create and sign a new block
 */
export declare function createBlock({ privateKey, previousHash, transactions, puzzleId, proposedAnswer }: {
    privateKey: PrivateKey;
    previousHash: string;
    transactions: Transaction[];
    puzzleId?: string;
    proposedAnswer?: string;
}): Block;
/**
 * Verify a block's signature and integrity
 */
export declare function verifyBlock(block: Block): boolean;
//# sourceMappingURL=index.d.ts.map