import { describe, expect, it } from 'vitest';
import { createAttestation, verifyAttestation } from '../src/attestation/index.js';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import type { Attestation } from '../src/types/index.js';

describe('Attestation Functions', () => {
  describe('createAttestation', () => {
    it('should create a valid attestation with correct structure', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer
      });

      expect(attestation).toHaveProperty('attesterPublicKey');
      expect(attestation).toHaveProperty('puzzleId');
      expect(attestation).toHaveProperty('attesterAnswer');
      expect(attestation).toHaveProperty('signature');

      expect(attestation.attesterPublicKey).toBe(keyPair.publicKey.hex);
      expect(attestation.puzzleId).toBe(puzzleId);
      expect(attestation.attesterAnswer).toBe(attesterAnswer);
      expect(typeof attestation.signature).toBe('string');
    });

    it('should create different signatures for different inputs', () => {
      const keyPair = generateKeyPair();
      const puzzleId1 = 'puzzle-123';
      const puzzleId2 = 'puzzle-456';
      const attesterAnswer = 'answer-abc';

      const attestation1 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId: puzzleId1,
        attesterAnswer
      });

      const attestation2 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId: puzzleId2,
        attesterAnswer
      });

      expect(attestation1.signature).not.toBe(attestation2.signature);
    });

    it('should create different signatures for different answers', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer1 = 'answer-abc';
      const attesterAnswer2 = 'answer-def';

      const attestation1 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer: attesterAnswer1
      });

      const attestation2 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer: attesterAnswer2
      });

      expect(attestation1.signature).not.toBe(attestation2.signature);
    });
  });

  describe('verifyAttestation', () => {
    it('should return true for a valid attestation', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer
      });

      const isValid = verifyAttestation(attestation);
      expect(isValid).toBe(true);
    });

    it('should return false for an attestation with tampered puzzleId', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer
      });

      // Tamper with the puzzleId
      const tamperedAttestation: Attestation = {
        ...attestation,
        puzzleId: 'tampered-puzzle-id'
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });

    it('should return false for an attestation with tampered attesterAnswer', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer
      });

      // Tamper with the attesterAnswer
      const tamperedAttestation: Attestation = {
        ...attestation,
        attesterAnswer: 'tampered-answer'
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });

    it('should return false for an attestation with tampered signature', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        attesterAnswer
      });

      // Tamper with the signature
      const tamperedAttestation: Attestation = {
        ...attestation,
        signature: 'tampered-signature-hex'
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });

    it('should return false for an attestation with wrong public key', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const attesterAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair1.privateKey,
        puzzleId,
        attesterAnswer
      });

      // Change the public key to a different one
      const tamperedAttestation: Attestation = {
        ...attestation,
        attesterPublicKey: keyPair2.publicKey.hex
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });
  });
}); 