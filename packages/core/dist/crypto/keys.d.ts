import type { KeyPair } from '../types/index.js';
/**
 * Generate a new 12-word BIP39 mnemonic phrase
 */
export declare function generateMnemonic(): string;
/**
 * Generate a deterministic keypair from a mnemonic phrase
 * Uses BIP39 seed generation followed by HKDF-like key derivation
 */
export declare function keyPairFromMnemonic(mnemonic: string): KeyPair;
//# sourceMappingURL=keys.d.ts.map