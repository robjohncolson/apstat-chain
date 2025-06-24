import * as bip39 from 'bip39';
/**
 * Generate a new mnemonic phrase
 */
export function generateMnemonic(strength = 128) {
    return bip39.generateMnemonic(strength);
}
/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
}
/**
 * Convert mnemonic to seed
 */
export function mnemonicToSeed(mnemonic, passphrase) {
    return bip39.mnemonicToSeed(mnemonic, passphrase);
}
/**
 * Convert mnemonic to seed synchronously
 */
export function mnemonicToSeedSync(mnemonic, passphrase) {
    return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}
/**
 * Convert entropy to mnemonic
 */
export function entropyToMnemonic(entropy) {
    return bip39.entropyToMnemonic(entropy);
}
/**
 * Convert mnemonic to entropy
 */
export function mnemonicToEntropy(mnemonic) {
    return bip39.mnemonicToEntropy(mnemonic);
}
//# sourceMappingURL=mnemonic.js.map