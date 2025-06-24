import { describe, expect, it } from 'vitest';
import { hash256, keccak256 } from '../src/crypto/hashing.js';
import { generateMnemonic, validateMnemonic } from '../src/crypto/mnemonic.js';
import { generateKeyPair, sign, verify } from '../src/crypto/secp256k1.js';

describe('Crypto Functions', () => {
  describe('secp256k1', () => {
    it('should generate a valid key pair', () => {
      const keyPair = generateKeyPair();
      
      expect(keyPair.privateKey.bytes).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey.bytes).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey.hex).toMatch(/^[0-9a-f]{64}$/i);
      expect(keyPair.publicKey.hex).toMatch(/^[0-9a-f]{66}$/i);
    });

    it('should sign and verify a message', () => {
      const keyPair = generateKeyPair();
      const message = new TextEncoder().encode('Hello, world!');
      const messageHash = hash256(message);
      
      const signature = sign(messageHash, keyPair.privateKey);
      const isValid = verify(signature, messageHash, keyPair.publicKey);
      
      expect(isValid).toBe(true);
    });
  });

  describe('hashing', () => {
    it('should hash data with SHA-256', () => {
      const data = new TextEncoder().encode('test');
      const hash = hash256(data);
      
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.length).toBe(32);
    });

    it('should hash data with Keccak-256', () => {
      const data = new TextEncoder().encode('test');
      const hash = keccak256(data);
      
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.length).toBe(32);
    });
  });

  describe('mnemonic', () => {
    it('should generate a valid mnemonic', () => {
      const mnemonic = generateMnemonic();
      
      expect(typeof mnemonic).toBe('string');
      expect(mnemonic.split(' ').length).toBe(12);
      expect(validateMnemonic(mnemonic)).toBe(true);
    });

    it('should validate mnemonics correctly', () => {
      const validMnemonic = generateMnemonic();
      const invalidMnemonic = 'invalid mnemonic phrase';
      
      expect(validateMnemonic(validMnemonic)).toBe(true);
      expect(validateMnemonic(invalidMnemonic)).toBe(false);
    });
  });
}); 