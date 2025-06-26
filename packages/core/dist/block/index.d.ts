import type { PrivateKey, Transaction } from '../types/index.js';
export interface Block {
    readonly id: string;
    readonly previousHash: string;
    readonly transactions: readonly Transaction[];
    readonly timestamp: number;
    readonly signature: string;
    readonly publicKey: string;
}
/**
 * Create and sign a new block
 */
export declare function createBlock({ privateKey, previousHash, transactions }: {
    privateKey: PrivateKey;
    previousHash: string;
    transactions: Transaction[];
}): Block;
/**
 * Verify a block's signature and integrity
 */
export declare function verifyBlock(block: Block): boolean;
//# sourceMappingURL=index.d.ts.map