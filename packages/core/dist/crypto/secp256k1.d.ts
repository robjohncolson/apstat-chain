import type { KeyPair, PrivateKey, PublicKey, Signature } from '../types/index.js';
/**
 * Generate a new secp256k1 key pair
 */
export declare function generateKeyPair(): KeyPair;
/**
 * Sign a message hash with a private key
 */
export declare function sign(messageHash: Uint8Array, privateKey: PrivateKey): Signature;
/**
 * Verify a signature against a message hash and public key
 */
export declare function verify(signature: Signature, messageHash: Uint8Array, publicKey: PublicKey): boolean;
//# sourceMappingURL=secp256k1.d.ts.map