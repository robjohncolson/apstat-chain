// Type definitions for the core package

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

// Transaction types
export interface Transaction {
  readonly id: string;
  readonly publicKey: string;
  readonly signature: string;
  readonly payload: any;
  readonly timestamp?: number; // Optional timestamp for UI compatibility
} 