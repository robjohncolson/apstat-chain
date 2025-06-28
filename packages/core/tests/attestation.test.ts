import { describe, expect, it } from 'vitest';
import { createAttestation, verifyAttestation } from '../src/attestation/index.js';
import { generateKeyPair } from '../src/crypto/secp256k1.js';
import type { Attestation } from '../src/types/index.js';

describe('Attestation Functions', () => {
  describe('createAttestation', () => {
    it('should create a valid attestation with correct structure', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer
      });

      expect(attestation).toHaveProperty('attesterPublicKey');
      expect(attestation).toHaveProperty('puzzleId');
      expect(attestation).toHaveProperty('proposedAnswer');
      expect(attestation).toHaveProperty('signature');

      expect(attestation.attesterPublicKey).toBe(keyPair.publicKey.hex);
      expect(attestation.puzzleId).toBe(puzzleId);
      expect(attestation.proposedAnswer).toBe(proposedAnswer);
      expect(typeof attestation.signature).toBe('string');
    });

    it('should create different signatures for different inputs', () => {
      const keyPair = generateKeyPair();
      const puzzleId1 = 'puzzle-123';
      const puzzleId2 = 'puzzle-456';
      const proposedAnswer = 'answer-abc';

      const attestation1 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId: puzzleId1,
        proposedAnswer
      });

      const attestation2 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId: puzzleId2,
        proposedAnswer
      });

      expect(attestation1.signature).not.toBe(attestation2.signature);
    });

    it('should create different signatures for different answers', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer1 = 'answer-abc';
      const proposedAnswer2 = 'answer-def';

      const attestation1 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer: proposedAnswer1
      });

      const attestation2 = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer: proposedAnswer2
      });

      expect(attestation1.signature).not.toBe(attestation2.signature);
    });
  });

  describe('verifyAttestation', () => {
    it('should return true for a valid attestation', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer
      });

      const isValid = verifyAttestation(attestation);
      expect(isValid).toBe(true);
    });

    it('should return false for an attestation with tampered puzzleId', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer
      });

      // Tamper with the puzzleId
      const tamperedAttestation: Attestation = {
        ...attestation,
        puzzleId: 'tampered-puzzle-id'
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });

    it('should return false for an attestation with tampered proposedAnswer', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer
      });

      // Tamper with the proposedAnswer
      const tamperedAttestation: Attestation = {
        ...attestation,
        proposedAnswer: 'tampered-answer'
      };

      const isValid = verifyAttestation(tamperedAttestation);
      expect(isValid).toBe(false);
    });

    it('should return false for an attestation with tampered signature', () => {
      const keyPair = generateKeyPair();
      const puzzleId = 'puzzle-123';
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair.privateKey,
        puzzleId,
        proposedAnswer
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
      const proposedAnswer = 'answer-abc';

      const attestation = createAttestation({
        privateKey: keyPair1.privateKey,
        puzzleId,
        proposedAnswer
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