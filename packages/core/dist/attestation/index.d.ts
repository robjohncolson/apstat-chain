import type { PrivateKey } from '../types/index.js';
import type { Attestation } from '../types/index.js';
/**
 * Parameters for creating an attestation
 */
export interface CreateAttestationParams {
    privateKey: PrivateKey;
    puzzleId: string;
    proposedAnswer: string;
}
/**
 * Create a cryptographically signed attestation for a puzzle answer
 */
export declare function createAttestation(params: CreateAttestationParams): Attestation;
/**
 * Verify a cryptographic attestation
 */
export declare function verifyAttestation(attestation: Attestation): boolean;
//# sourceMappingURL=index.d.ts.map