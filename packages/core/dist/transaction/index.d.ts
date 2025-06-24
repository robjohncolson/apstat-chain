import type { PrivateKey, Transaction } from '../types/index.js';
export type { Transaction } from '../types/index.js';
/**
 * Create and sign a new transaction
 */
export declare function createTransaction(privateKey: PrivateKey, payload: any): Transaction;
/**
 * Verify a transaction's signature and integrity
 */
export declare function verifyTransaction(transaction: Transaction): boolean;
//# sourceMappingURL=index.d.ts.map