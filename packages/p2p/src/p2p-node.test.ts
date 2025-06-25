import { describe, it, expect } from 'vitest';
import { keyPairFromMnemonic, peerIdFromPublicKey } from '@apstat-chain/core';
import { P2PNode } from './p2p-node';

describe('P2PNode', () => {
  it('should initialize with a deterministic Peer ID derived from the keypair', async () => {
    // Fixed test mnemonic
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    // Generate KeyPair from the fixed mnemonic
    const keyPair = keyPairFromMnemonic(testMnemonic);
    
    // Calculate the expected Peer ID
    const expectedPeerId = peerIdFromPublicKey(keyPair.publicKey);
    
    // Instantiate a new P2PNode
    const p2pNode = new P2PNode(keyPair);
    
    // Assert that the actual peer ID matches the expected deterministic one
    expect(p2pNode.getPeerJsId()).toBe(expectedPeerId);
  });
}); 