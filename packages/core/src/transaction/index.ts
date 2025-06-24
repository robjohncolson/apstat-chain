import * as secp256k1 from '@noble/secp256k1';
import { hash256 } from '../crypto/hashing.js';
import { sign, verify } from '../crypto/secp256k1.js';
import type { PrivateKey, PublicKey, Transaction } from '../types/index.js';

// Re-export the Transaction type for convenience
export type { Transaction } from '../types/index.js';

/**
 * Derive public key from private key
 */
function derivePublicKey(privateKey: PrivateKey): PublicKey {
  const publicKeyBytes = secp256k1.getPublicKey(privateKey.bytes);
  return {
    bytes: publicKeyBytes,
    hex: secp256k1.etc.bytesToHex(publicKeyBytes)
  };
}

/**
 * Create a deterministic hash from transaction data (excluding signature)
 */
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

function createTransactionHash(payload: any, timestamp: number, authorPublicKey: PublicKey): string {
  // Create a canonical string representation of the transaction data
  const transactionData = {
    authorPublicKey: authorPublicKey.hex,
    payload,
    timestamp
  };
  
  // Convert to deterministic JSON string
  const jsonString = deterministicStringify(transactionData);
  
  // Convert string to bytes and hash
  const dataBytes = new TextEncoder().encode(jsonString);
  const hashBytes = hash256(dataBytes);
  
  // Convert hash to hex string
  return Array.from(hashBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create and sign a new transaction
 */
export function createTransaction(privateKey: PrivateKey, payload: any): Transaction {
  // Derive the public key from the private key
  const authorPublicKey = derivePublicKey(privateKey);
  
  const timestamp = Date.now();
  
  // Create the data that will be signed (without signature and ID)
  const signingData = {
    authorPublicKey: authorPublicKey.hex,
    payload,
    timestamp
  };
  
  const signingString = deterministicStringify(signingData);
  const signingBytes = new TextEncoder().encode(signingString);
  const signingHash = hash256(signingBytes);
  
  // Sign this hash
  const signature = sign(signingHash, privateKey);
  
  // Now create the transaction ID based on all data including signature
  const id = createTransactionHash(payload, timestamp, authorPublicKey);
  
  return {
    payload,
    timestamp,
    authorPublicKey,
    id,
    signature
  };
}

/**
 * Verify a transaction's signature and integrity
 */
export function verifyTransaction(transaction: Transaction): boolean {
  try {
    // 1. Verify the transaction ID is correct for the current data
    const expectedId = createTransactionHash(
      transaction.payload,
      transaction.timestamp,
      transaction.authorPublicKey
    );
    
    if (transaction.id !== expectedId) {
      return false;
    }
    
    // 2. Recreate the data that should have been signed (without signature and ID)
    const signingData = {
      authorPublicKey: transaction.authorPublicKey.hex,
      payload: transaction.payload,
      timestamp: transaction.timestamp
    };
    
    const signingString = deterministicStringify(signingData);
    const signingBytes = new TextEncoder().encode(signingString);
    const signingHash = hash256(signingBytes);
    
    // 3. Verify the signature against the recreated signing hash
    return verify(transaction.signature, signingHash, transaction.authorPublicKey);
  } catch (error) {
    return false;
  }
} 