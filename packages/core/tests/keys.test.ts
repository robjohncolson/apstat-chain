import { describe, expect, it } from 'vitest';
import { generateMnemonic, keyPairFromMnemonic, peerIdFromPublicKey } from '../src/crypto/keys.js';

describe('Keys Module', () => {
  describe('generateMnemonic', () => {
    it('should return a valid 12-word BIP39 mnemonic phrase', () => {
      const mnemonic = generateMnemonic();
      
      expect(typeof mnemonic).toBe('string');
      
      // Should be 12 words
      const words = mnemonic.split(' ');
      expect(words.length).toBe(12);
      
      // Should contain only valid characters (lowercase letters and spaces)
      expect(mnemonic).toMatch(/^[a-z ]+$/);
      
      // Each word should be non-empty
      words.forEach(word => {
        expect(word.length).toBeGreaterThan(0);
        expect(word).toMatch(/^[a-z]+$/);
      });
    });

    it('should generate different mnemonics each time', () => {
      const mnemonic1 = generateMnemonic();
      const mnemonic2 = generateMnemonic();
      
      expect(mnemonic1).not.toBe(mnemonic2);
    });
  });

  describe('keyPairFromMnemonic', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    it('should generate a consistent keypair from the same mnemonic', () => {
      const keyPair1 = keyPairFromMnemonic(testMnemonic);
      const keyPair2 = keyPairFromMnemonic(testMnemonic);
      
      // Same mnemonic should always produce the same keypair
      expect(keyPair1.privateKey.hex).toBe(keyPair2.privateKey.hex);
      expect(keyPair1.publicKey.hex).toBe(keyPair2.publicKey.hex);
      
      // Verify the structures are correct
      expect(keyPair1.privateKey.bytes).toBeInstanceOf(Uint8Array);
      expect(keyPair1.publicKey.bytes).toBeInstanceOf(Uint8Array);
      expect(keyPair1.privateKey.hex).toMatch(/^[0-9a-f]{64}$/i);
      expect(keyPair1.publicKey.hex).toMatch(/^[0-9a-f]{66}$/i);
    });

    it('should generate different keypairs for different mnemonics', () => {
      const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const mnemonic2 = 'utility during search tuition path common roof illness armed essay bargain tackle';
      
      const keyPair1 = keyPairFromMnemonic(mnemonic1);
      const keyPair2 = keyPairFromMnemonic(mnemonic2);
      
      expect(keyPair1.privateKey.hex).not.toBe(keyPair2.privateKey.hex);
      expect(keyPair1.publicKey.hex).not.toBe(keyPair2.publicKey.hex);
    });

    it('should generate the same keypair multiple times for the same mnemonic', () => {
      const mnemonic = generateMnemonic();
      
      const keyPair1 = keyPairFromMnemonic(mnemonic);
      const keyPair2 = keyPairFromMnemonic(mnemonic);
      const keyPair3 = keyPairFromMnemonic(mnemonic);
      
      // All should be identical
      expect(keyPair1.privateKey.hex).toBe(keyPair2.privateKey.hex);
      expect(keyPair2.privateKey.hex).toBe(keyPair3.privateKey.hex);
      expect(keyPair1.publicKey.hex).toBe(keyPair2.publicKey.hex);
      expect(keyPair2.publicKey.hex).toBe(keyPair3.publicKey.hex);
    });

    it('should throw an error for invalid mnemonic', () => {
      const invalidMnemonic = 'invalid mnemonic phrase';
      
      expect(() => keyPairFromMnemonic(invalidMnemonic)).toThrow();
    });
  });

  describe('peerIdFromPublicKey', () => {
    const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const mnemonic2 = 'utility during search tuition path common roof illness armed essay bargain tackle';
    
    it('should generate a consistent peer ID from the same public key', () => {
      // Create two distinct keypairs from known mnemonics
      const keyPair1 = keyPairFromMnemonic(mnemonic1);
      const keyPair2 = keyPairFromMnemonic(mnemonic2);
      
      // Test first keypair produces non-empty string
      const peerId1 = peerIdFromPublicKey(keyPair1.publicKey);
      expect(peerId1).toBeTruthy();
      expect(typeof peerId1).toBe('string');
      expect(peerId1.length).toBeGreaterThan(0);
      
      // Test same keypair produces identical result
      const peerId1Repeat = peerIdFromPublicKey(keyPair1.publicKey);
      expect(peerId1Repeat).toBe(peerId1);
      
      // Test different keypair produces different peer ID
      const peerId2 = peerIdFromPublicKey(keyPair2.publicKey);
      expect(peerId2).not.toBe(peerId1);
      expect(peerId2).toBeTruthy();
      expect(typeof peerId2).toBe('string');
      expect(peerId2.length).toBeGreaterThan(0);
    });
  });
}); 