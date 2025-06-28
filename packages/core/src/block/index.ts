import * as secp256k1 from '@noble/secp256k1';
import { hash256 } from '../crypto/hashing.js';
import { verifyAttestation } from '../attestation/index.js';
import type { PrivateKey, Transaction, Block, Attestation } from '../types/index.js';

// Re-export Block type for backward compatibility
export type { Block } from '../types/index.js';

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
 * Create and sign a new block
 */
export function createBlock({
  privateKey,
  previousHash,
  transactions,
  puzzleId,
  proposedAnswer
}: {
  privateKey: PrivateKey;
  previousHash: string;
  transactions: Transaction[];
  puzzleId?: string;
  proposedAnswer?: string;
}): Block {
  // Derive the public key from the private key
  const publicKey = secp256k1.getPublicKey(privateKey.bytes);
  const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
  
  // Create timestamp
  const timestamp = Date.now();
  
  // Create the data that will be signed
  const blockData: any = {
    previousHash,
    transactions,
    timestamp,
    publicKey: publicKeyHex
  };
  
  // Add puzzle data if provided (for candidate blocks)
  if (puzzleId !== undefined) {
    blockData.puzzleId = puzzleId;
  }
  if (proposedAnswer !== undefined) {
    blockData.proposedAnswer = proposedAnswer;
  }
  
  const signingString = deterministicStringify(blockData);
  const signingBytes = new TextEncoder().encode(signingString);
  const hash = hash256(signingBytes);
  
  // Sign the hash
  const signature = secp256k1.sign(hash, privateKey.bytes);
  
  // Create block ID from the hash
  const id = secp256k1.etc.bytesToHex(hash);
  
  const block: Block = {
    id,
    previousHash,
    transactions,
    timestamp,
    signature: signature.toCompactHex(),
    publicKey: publicKeyHex
  };
  
  // Add optional properties if provided
  if (puzzleId !== undefined) {
    (block as any).puzzleId = puzzleId;
  }
  if (proposedAnswer !== undefined) {
    (block as any).proposedAnswer = proposedAnswer;
  }
  
  return block;
}

/**
 * Verify a block's signature and integrity
 */
export function verifyBlock(block: Block): boolean {
  try {
    const { id, signature, previousHash, transactions, timestamp, publicKey, puzzleId, proposedAnswer, attestations } = block;
    
    // Check if this is a Genesis block (no previous hash or has the genesis previous hash pattern)
    const isGenesisBlock = previousHash === '0'.repeat(64);
    
    // Social Consensus validation: blocks with transactions must have PoK puzzle data (except Genesis)
    if (!isGenesisBlock && transactions.length > 0) {
      if (!puzzleId || !proposedAnswer || !attestations) {
        return false;
      }
      
      // Verify all attestations are valid
      for (const attestation of attestations) {
        if (!verifyAttestation(attestation)) {
          return false;
        }
        
        // Verify attestation matches block's puzzle data
        if (attestation.puzzleId !== puzzleId || attestation.proposedAnswer !== proposedAnswer) {
          return false;
        }
      }
    }
    
    // Recreate the data that should have been signed
    const blockData: any = {
      previousHash,
      transactions,
      timestamp,
      publicKey
    };
    
    // Add puzzle data to signing data if present
    if (puzzleId !== undefined) {
      blockData.puzzleId = puzzleId;
    }
    if (proposedAnswer !== undefined) {
      blockData.proposedAnswer = proposedAnswer;
    }
    
    const signingString = deterministicStringify(blockData);
    const signingBytes = new TextEncoder().encode(signingString);
    const hash = hash256(signingBytes);
    
    // Verify the block ID matches the hash
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