import * as secp256k1 from '@noble/secp256k1';
import { hash256 } from '../crypto/hashing.js';
import { sign, verify } from '../crypto/secp256k1.js';
/**
 * Create a cryptographically signed attestation for a puzzle answer
 */
export function createAttestation(params) {
    const { privateKey, puzzleId, attesterAnswer } = params;
    // Derive the public key from the private key (in hex format)
    const publicKeyBytes = secp256k1.getPublicKey(privateKey.bytes);
    const attesterPublicKey = secp256k1.etc.bytesToHex(publicKeyBytes);
    // Create a message to sign by concatenating puzzleId and attesterAnswer
    const message = `${puzzleId}:${attesterAnswer}`;
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = hash256(messageBytes);
    // Sign the message hash
    const signature = sign(messageHash, privateKey);
    // Convert signature to hex string for storage
    const signatureHex = JSON.stringify({
        r: signature.r.toString(16),
        s: signature.s.toString(16),
        recovery: signature.recovery
    });
    return {
        attesterPublicKey,
        puzzleId,
        attesterAnswer,
        signature: signatureHex
    };
}
/**
 * Verify a cryptographic attestation
 */
export function verifyAttestation(attestation) {
    try {
        const { attesterPublicKey, puzzleId, attesterAnswer, signature } = attestation;
        // Parse the signature from hex string
        const signatureObj = JSON.parse(signature);
        const parsedSignature = {
            r: BigInt('0x' + signatureObj.r),
            s: BigInt('0x' + signatureObj.s),
            recovery: signatureObj.recovery
        };
        // Recreate the message that was signed
        const message = `${puzzleId}:${attesterAnswer}`;
        const messageBytes = new TextEncoder().encode(message);
        const messageHash = hash256(messageBytes);
        // Convert public key hex to PublicKey object
        const publicKeyBytes = secp256k1.etc.hexToBytes(attesterPublicKey);
        const publicKey = {
            bytes: publicKeyBytes,
            hex: attesterPublicKey
        };
        // Verify the signature
        return verify(parsedSignature, messageHash, publicKey);
    }
    catch (error) {
        // If any parsing or verification fails, the attestation is invalid
        return false;
    }
}
//# sourceMappingURL=index.js.map