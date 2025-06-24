/**
 * Generate a new mnemonic phrase
 */
export declare function generateMnemonic(strength?: number): string;
/**
 * Validate a mnemonic phrase
 */
export declare function validateMnemonic(mnemonic: string): boolean;
/**
 * Convert mnemonic to seed
 */
export declare function mnemonicToSeed(mnemonic: string, passphrase?: string): Promise<Buffer>;
/**
 * Convert mnemonic to seed synchronously
 */
export declare function mnemonicToSeedSync(mnemonic: string, passphrase?: string): Buffer;
/**
 * Convert entropy to mnemonic
 */
export declare function entropyToMnemonic(entropy: Buffer): string;
/**
 * Convert mnemonic to entropy
 */
export declare function mnemonicToEntropy(mnemonic: string): string;
//# sourceMappingURL=mnemonic.d.ts.map