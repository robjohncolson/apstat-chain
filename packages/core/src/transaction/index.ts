import * as secp256k1 from '@noble/secp256k1';
import { hash256 } from '../crypto/hashing.js';
import type { PrivateKey, Transaction } from '../types/index.js';

// Re-export the Transaction type for convenience
export type { Transaction } from '../types/index.js';

/**
 * Create deterministic JSON string with sorted keys
 */
function deterministicStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }
  
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => deterministicStringify(item)).join(',') + ']';
  }
  
  // For objects, sort keys and recursively stringify
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `"${key}":${deterministicStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Create and sign a new transaction
 */
export function createTransaction(privateKey: PrivateKey, payload: any): Transaction {
  // Derive the public key from the private key
  const publicKey = secp256k1.getPublicKey(privateKey.bytes);
  const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
  
  // Create the data that will be signed
  const signingData = {
    publicKey: publicKeyHex,
    payload
  };
  
  const signingString = deterministicStringify(signingData);
  const signingBytes = new TextEncoder().encode(signingString);
  const hash = hash256(signingBytes);
  
  // Sign the hash
  const signature = secp256k1.sign(hash, privateKey.bytes);
  
  // Create transaction ID from the hash
  const id = secp256k1.etc.bytesToHex(hash);
  
  return {
    id,
    publicKey: publicKeyHex,
    signature: signature.toCompactHex(),
    payload,
  };
}

/**
 * Verify a transaction's signature and integrity
 */
export function verifyTransaction(transaction: Transaction): boolean {
  try {
    const { id, signature, payload, publicKey } = transaction;
    
    // Recreate the data that should have been signed
    const signingData = {
      publicKey,
      payload
    };
    
    const signingString = deterministicStringify(signingData);
    const signingBytes = new TextEncoder().encode(signingString);
    const hash = hash256(signingBytes);
    
    // Verify the transaction ID matches the hash
    const expectedId = secp256k1.etc.bytesToHex(hash);
    if (id !== expectedId) {
      return false;
    }
    
    // Verify the signature
    const sig = secp256k1.Signature.fromCompact(signature);
    const pubKeyBytes = secp256k1.etc.hexToBytes(publicKey);
    
    return secp256k1.verify(sig, hash, pubKeyBytes);
  } catch (error) {
    return false;
  }
} 