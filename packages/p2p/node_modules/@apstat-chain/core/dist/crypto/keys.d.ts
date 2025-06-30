import type { KeyPair, PublicKey } from '../types/index.js';
/**
 * Generate a new 12-word BIP39 mnemonic phrase
 */
export declare function generateMnemonic(): string;
/**
 * Generate a deterministic keypair from a mnemonic phrase
 * Uses BIP39 seed generation followed by HKDF-like key derivation
 */
export declare function keyPairFromMnemonic(mnemonic: string): KeyPair;
/**
 * Generate a peer ID from a public key
 * Uses SHA256 hash of the public key bytes, taking the first 16 bytes as hex
 */
export declare function peerIdFromPublicKey(publicKey: PublicKey): string;
//# sourceMappingURL=keys.d.ts.map