import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
// Set up HMAC for secp256k1
secp256k1.etc.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, secp256k1.etc.concatBytes(...msgs));
/**
 * Generate a new secp256k1 key pair
 */
export function generateKeyPair() {
    const privateKeyBytes = secp256k1.utils.randomPrivateKey();
    const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);
    return {
        privateKey: {
            bytes: privateKeyBytes,
            hex: secp256k1.etc.bytesToHex(privateKeyBytes)
        },
        publicKey: {
            bytes: publicKeyBytes,
            hex: secp256k1.etc.bytesToHex(publicKeyBytes)
        }
    };
}
/**
 * Sign a message hash with a private key
 */
export function sign(messageHash, privateKey) {
    const signature = secp256k1.sign(messageHash, privateKey.bytes);
    return {
        r: signature.r,
        s: signature.s,
        recovery: signature.recovery
    };
}
/**
 * Verify a signature against a message hash and public key
 */
export function verify(signature, messageHash, publicKey) {
    try {
        return secp256k1.verify({ r: signature.r, s: signature.s }, messageHash, publicKey.bytes);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=secp256k1.js.map