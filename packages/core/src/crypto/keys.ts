import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
import type { KeyPair } from '../types/index.js';
import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeedSync, validateMnemonic } from './mnemonic.js';

// Set up HMAC for secp256k1
secp256k1.etc.hmacSha256Sync = (key: Uint8Array, ...msgs: Uint8Array[]) => 
  hmac(sha256, key, secp256k1.etc.concatBytes(...msgs));

/**
 * Generate a new 12-word BIP39 mnemonic phrase
 */
export function generateMnemonic(): string {
  return bip39GenerateMnemonic(128); // 128 bits = 12 words
}

/**
 * Generate a deterministic keypair from a mnemonic phrase
 * Uses BIP39 seed generation followed by HKDF-like key derivation
 */
export function keyPairFromMnemonic(mnemonic: string): KeyPair {
  // Validate the mnemonic first
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Convert mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic);
  
  // Use HMAC-SHA256 to derive a private key from the seed
  // This follows a similar pattern to BIP32 but simplified for our use case
  const privateKeyMaterial = hmac(sha256, new Uint8Array([0]), seed);
  
  // Ensure the private key is valid for secp256k1
  let privateKeyBytes = privateKeyMaterial.slice(0, 32);
  
  // In the extremely unlikely case that the derived key is invalid, 
  // use additional rounds of hashing
  let counter = 1;
  while (!secp256k1.utils.isValidPrivateKey(privateKeyBytes)) {
    const counterBytes = new Uint8Array(4);
    new DataView(counterBytes.buffer).setUint32(0, counter, false);
    privateKeyBytes = hmac(sha256, counterBytes, privateKeyMaterial).slice(0, 32);
    counter++;
    
    // Safety check to prevent infinite loop (extremely unlikely to hit)
    if (counter > 1000) {
      throw new Error('Unable to derive valid private key from mnemonic');
    }
  }

  // Generate the public key
  const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);

  return {
    privateKey: {
      bytes: privateKeyBytes,
      hex: secp256k1.etc.bytesToHex(privateKeyBytes)
    },
    publicKey: {
      bytes: publicKeyBytes,
      hex: secp256k1.etc.bytesToHex(publicKeyBytes)
    }
  };
} 