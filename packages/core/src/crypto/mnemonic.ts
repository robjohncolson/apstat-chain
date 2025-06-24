import * as bip39 from 'bip39';

/**
 * Generate a new mnemonic phrase
 */
export function generateMnemonic(strength: number = 128): string {
  return bip39.generateMnemonic(strength);
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Convert mnemonic to seed
 */
export function mnemonicToSeed(mnemonic: string, passphrase?: string): Promise<Buffer> {
  return bip39.mnemonicToSeed(mnemonic, passphrase);
}

/**
 * Convert mnemonic to seed synchronously
 */
export function mnemonicToSeedSync(mnemonic: string, passphrase?: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

/**
 * Convert entropy to mnemonic
 */
export function entropyToMnemonic(entropy: Buffer): string {
  return bip39.entropyToMnemonic(entropy);
}

/**
 * Convert mnemonic to entropy
 */
export function mnemonicToEntropy(mnemonic: string): string {
  return bip39.mnemonicToEntropy(mnemonic);
} 