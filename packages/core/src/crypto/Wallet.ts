import { generateMnemonic, keyPairFromMnemonic } from './keys.js';
import type { KeyPair } from '../types/index.js';

/**
 * Wallet class for managing cryptographic keys and mnemonic phrases
 */
export class Wallet {
  private keyPair: KeyPair;
  private mnemonic: string;

  /**
   * Generates a new, cryptographically valid 12-word mnemonic phrase.
   * This is a static method, so it can be called without creating an instance of the Wallet.
   * e.g., Wallet.generateMnemonic()
   */
  static generateMnemonic(): string {
    return generateMnemonic();
  }

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.keyPair = keyPairFromMnemonic(mnemonic);
  }

  /**
   * Get the wallet's key pair
   */
  getKeyPair(): KeyPair {
    return this.keyPair;
  }

  /**
   * Get the wallet's mnemonic phrase
   */
  getMnemonic(): string {
    return this.mnemonic;
  }

  /**
   * Get the wallet's public key hex string
   */
  getPublicKeyHex(): string {
    return this.keyPair.publicKey.hex;
  }

  /**
   * Get the wallet's private key hex string
   */
  getPrivateKeyHex(): string {
    return this.keyPair.privateKey.hex;
  }
} 