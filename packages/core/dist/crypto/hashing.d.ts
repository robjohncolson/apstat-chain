/**
 * SHA-256 hash function
 */
export declare function hash256(data: Uint8Array): Uint8Array;
/**
 * Double SHA-256 hash (Bitcoin-style)
 */
export declare function hash256Double(data: Uint8Array): Uint8Array;
/**
 * RIPEMD-160 hash function
 */
export declare function hash160(data: Uint8Array): Uint8Array;
/**
 * Keccak-256 hash function (Ethereum-style)
 */
export declare function keccak256(data: Uint8Array): Uint8Array;
/**
 * Bitcoin-style hash160: RIPEMD-160(SHA-256(data))
 */
export declare function bitcoinHash160(data: Uint8Array): Uint8Array;
//# sourceMappingURL=hashing.d.ts.map