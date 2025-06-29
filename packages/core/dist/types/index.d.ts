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
    readonly id: string;
    readonly publicKey: string;
    readonly signature: string;
    readonly payload: any;
    readonly timestamp?: number;
}
export interface Attestation {
    readonly attesterPublicKey: string;
    readonly puzzleId: string;
    readonly attesterAnswer: string;
    readonly signature: string;
}
export interface Block {
    readonly id: string;
    readonly previousHash: string;
    readonly transactions: readonly Transaction[];
    readonly timestamp: number;
    readonly signature: string;
    readonly publicKey: string;
    readonly puzzleId?: string;
    readonly proposedAnswer?: string;
    readonly attestations?: Attestation[];
}
//# sourceMappingURL=index.d.ts.map