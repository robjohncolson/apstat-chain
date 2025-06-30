import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { keccak_256 } from '@noble/hashes/sha3';
/**
 * SHA-256 hash function
 */
export function hash256(data) {
    return sha256(data);
}
/**
 * Double SHA-256 hash (Bitcoin-style)
 */
export function hash256Double(data) {
    return sha256(sha256(data));
}
/**
 * RIPEMD-160 hash function
 */
export function hash160(data) {
    return ripemd160(data);
}
/**
 * Keccak-256 hash function (Ethereum-style)
 */
export function keccak256(data) {
    return keccak_256(data);
}
/**
 * Bitcoin-style hash160: RIPEMD-160(SHA-256(data))
 */
export function bitcoinHash160(data) {
    return ripemd160(sha256(data));
}
//# sourceMappingURL=hashing.js.map