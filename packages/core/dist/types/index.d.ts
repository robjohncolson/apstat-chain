export interface PublicKey {
    readonly bytes: Uint8Array;
    readonly hex: string;
}
export interface PrivateKey {
    readonly bytes: Uint8Array;
    readonly hex: string;
}
export interface KeyPair {
    readonly publicKey: PublicKey;
    readonly privateKey: PrivateKey;
}
export interface Signature {
    readonly r: bigint;
    readonly s: bigint;
    readonly recovery?: number;
}
export interface Transaction {
    readonly payload: any;
    readonly timestamp: number;
    readonly authorPublicKey: PublicKey;
    readonly id: string;
    readonly signature: Signature;
}
//# sourceMappingURL=index.d.ts.map