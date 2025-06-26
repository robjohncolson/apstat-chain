import * as secp256k1 from '@noble/secp256k1';
import { hash256 } from '../crypto/hashing.js';
/**
 * Create deterministic JSON string with sorted keys
 */
function deterministicStringify(obj) {
    if (obj === null || obj === undefined) {
        return JSON.stringify(obj);
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(item => deterministicStringify(item)).join(',') + ']';
    }
    // For objects, sort keys and recursively stringify
    const sortedKeys = Object.keys(obj).sort();
    const pairs = sortedKeys.map(key => `"${key}":${deterministicStringify(obj[key])}`);
    return '{' + pairs.join(',') + '}';
}
/**
 * Create and sign a new block
 */
export function createBlock({ privateKey, previousHash, transactions }) {
    // Derive the public key from the private key
    const publicKey = secp256k1.getPublicKey(privateKey.bytes);
    const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
    // Create timestamp
    const timestamp = Date.now();
    // Create the data that will be signed
    const blockData = {
        previousHash,
        transactions,
        timestamp,
        publicKey: publicKeyHex
    };
    const signingString = deterministicStringify(blockData);
    const signingBytes = new TextEncoder().encode(signingString);
    const hash = hash256(signingBytes);
    // Sign the hash
    const signature = secp256k1.sign(hash, privateKey.bytes);
    // Create block ID from the hash
    const id = secp256k1.etc.bytesToHex(hash);
    return {
        id,
        previousHash,
        transactions,
        timestamp,
        signature: signature.toCompactHex(),
        publicKey: publicKeyHex
    };
}
/**
 * Verify a block's signature and integrity
 */
export function verifyBlock(block) {
    try {
        const { id, signature, previousHash, transactions, timestamp, publicKey } = block;
        // Recreate the data that should have been signed
        const blockData = {
            previousHash,
            transactions,
            timestamp,
            publicKey
        };
        const signingString = deterministicStringify(blockData);
        const signingBytes = new TextEncoder().encode(signingString);
        const hash = hash256(signingBytes);
        // Verify the block ID matches the hash
        const expectedId = secp256k1.etc.bytesToHex(hash);
        if (id !== expectedId) {
            return false;
        }
        // Verify the signature
        const sig = secp256k1.Signature.fromCompact(signature);
        const pubKeyBytes = secp256k1.etc.hexToBytes(publicKey);
        return secp256k1.verify(sig, hash, pubKeyBytes);
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=index.js.map