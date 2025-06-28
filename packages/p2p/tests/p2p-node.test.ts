import type { Transaction, Block, Attestation } from '@apstat-chain/core';
import { peerIdFromPublicKey } from '@apstat-chain/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { P2PNode } from '../src/p2p-node';

// Mock the entire peerjs module
vi.mock('peerjs', () => {
  const mockDataConnection = {
    on: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    peer: 'test-peer-id',
    open: true
  };

  const mockPeer = {
    id: 'local-peer-id',
    on: vi.fn(),
    connect: vi.fn(() => mockDataConnection),
    destroy: vi.fn(),
    open: true,
    connections: {},
    disconnected: false,
    destroyed: false
  };

  return {
    default: vi.fn(() => mockPeer),
    Peer: vi.fn(() => mockPeer)
  };
});

// Import the mocked Peer constructor
import { Peer } from 'peerjs';
const MockedPeer = Peer as any;

// Mock KeyPair for tests
const mockKeyPair = {
  privateKey: {
    bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
    hex: '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20'
  },
  publicKey: {
    bytes: new Uint8Array([2, 121, 190, 102, 126, 249, 220, 187, 172, 85, 160, 98, 149, 206, 135, 11, 7, 2, 155, 252, 219, 45, 206, 40, 217, 89, 242, 129, 91, 22, 248, 23, 152]),
    hex: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
  }
};

describe('P2PNode', () => {
  let p2pNode: P2PNode;
  let mockPeer: any;
  let mockDataConnection: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock implementations
    mockDataConnection = {
      on: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      peer: 'test-peer-id',
      open: true
    };

    mockPeer = {
      id: 'local-peer-id',
      on: vi.fn(),
      connect: vi.fn(() => mockDataConnection),
      destroy: vi.fn(),
      open: true,
      connections: {},
      disconnected: false,
      destroyed: false
    };

    MockedPeer.mockReturnValue(mockPeer);
  });

  describe('initialization', () => {
    it('should initialize a PeerJS instance', () => {
      p2pNode = new P2PNode(mockKeyPair);
      
      expect(MockedPeer).toHaveBeenCalledTimes(1);
      expect(mockPeer.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockPeer.on).toHaveBeenCalledWith('connection', expect.any(Function));
      expect(mockPeer.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should initialize with a Peer ID derived from a keypair', () => {
      // Create a mock keypair object
      const testKeyPair = {
        privateKey: {
          bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
          hex: '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20'
        },
        publicKey: {
          bytes: new Uint8Array([2, 121, 190, 102, 126, 249, 220, 187, 172, 85, 160, 98, 149, 206, 135, 11, 7, 2, 155, 252, 219, 45, 206, 40, 217, 89, 242, 129, 91, 22, 248, 23, 152]),
          hex: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
        }
      };

      // Use the real peerIdFromPublicKey function to calculate the expected peer ID
      const expectedPeerId = peerIdFromPublicKey(testKeyPair.publicKey);

      // Instantiate a new P2PNode with the mock keypair
      p2pNode = new P2PNode(testKeyPair);

      // Assert that the mocked Peer constructor was called with the expected peer ID
      expect(MockedPeer).toHaveBeenCalledWith(expectedPeerId);
    });
  });

  describe('peer connections', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should connect to another peer', () => {
      const targetPeerId = 'target-peer-id';
      
      p2pNode.connectToPeer(targetPeerId);
      
      expect(mockPeer.connect).toHaveBeenCalledWith(targetPeerId);
      expect(mockDataConnection.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('data', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should handle incoming peer connections', () => {
      // Simulate an incoming connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      expect(connectionHandler).toBeDefined();
      
      // Trigger the connection event
      connectionHandler(mockDataConnection);
      
      expect(mockDataConnection.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('data', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockDataConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should get peer ID once available', () => {
      expect(p2pNode.getPeerId()).toBe('local-peer-id');
    });

    it('should return null for peer ID if not yet available', () => {
      mockPeer.id = null;
      p2pNode = new P2PNode(mockKeyPair);
      
      expect(p2pNode.getPeerId()).toBeNull();
    });
  });

  describe('transaction broadcasting', () => {
    let mockDataConnection2: any;

    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
      
      // Create a second mock connection for testing multiple peers
      mockDataConnection2 = {
        on: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        peer: 'test-peer-id-2',
        open: true
      };
      
      // Mock the connect method to return different connections
      let connectionCount = 0;
      mockPeer.connect = vi.fn(() => {
        connectionCount++;
        return connectionCount === 1 ? mockDataConnection : mockDataConnection2;
      });
      
      // Set up first connection
      p2pNode.connectToPeer('peer1');
      
      // Simulate the first connection opening
      const openHandler1 = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler1) {
        openHandler1();
      }
      
      // Set up second connection
      p2pNode.connectToPeer('peer2');
      
      // Simulate the second connection opening
      const openHandler2 = mockDataConnection2.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler2) {
        openHandler2();
      }
    });

    it('should broadcast a valid transaction to all connected peers', () => {
      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        publicKey: '010203',
        id: 'transaction-123',
        signature: 'mock-signature-string'
      };

      p2pNode.broadcastTransaction(mockTransaction);

      // Should send to both connections: 1 call for peer list (on open) + 1 call for transaction
      expect(mockDataConnection.send).toHaveBeenCalledTimes(2);
      expect(mockDataConnection2.send).toHaveBeenCalledTimes(2);
      
      // Check that transaction was sent (should be the second call, after peer list)
      const expectedSerializedTransaction = mockTransaction;

      expect(mockDataConnection.send).toHaveBeenNthCalledWith(2, {
        type: 'transaction',
        data: expectedSerializedTransaction
      });
      expect(mockDataConnection2.send).toHaveBeenNthCalledWith(2, {
        type: 'transaction',
        data: expectedSerializedTransaction
      });
    });

    it('should not broadcast if no connections exist', () => {
      const p2pNodeIsolated = new P2PNode(mockKeyPair);
      
      // Clear any previous calls since we're creating a new isolated instance
      vi.clearAllMocks();
      
      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        publicKey: '010203',
        id: 'transaction-123',
        signature: 'mock-signature-string'
      };

      p2pNodeIsolated.broadcastTransaction(mockTransaction);

      // Since there are no connections, send should not be called at all
      expect(mockDataConnection.send).not.toHaveBeenCalled();
      expect(mockDataConnection2.send).not.toHaveBeenCalled();
    });

    it('should handle broadcast errors gracefully', () => {
      mockDataConnection.send.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        publicKey: '010203',
        id: 'transaction-123',
        signature: 'mock-signature-string'
      };

      // Should not throw
      expect(() => p2pNode.broadcastTransaction(mockTransaction)).not.toThrow();
    });
  });

  describe('transaction receiving', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should emit "transaction:received" event upon receiving a transaction', () => {
      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        publicKey: '010203',
        id: 'transaction-123',
        signature: 'mock-signature-string'
      };

      const transactionHandler = vi.fn();
      p2pNode.on('transaction:received', transactionHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler that was registered
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      expect(dataHandler).toBeDefined();

      // Simulate receiving transaction data
      dataHandler({
        type: 'transaction',
        data: mockTransaction
      });

      expect(transactionHandler).toHaveBeenCalledTimes(1);
      expect(transactionHandler).toHaveBeenCalledWith(mockTransaction);
    });

    it('should ignore non-transaction messages', () => {
      const transactionHandler = vi.fn();
      p2pNode.on('transaction:received', transactionHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      // Simulate receiving non-transaction data
      dataHandler({
        type: 'heartbeat',
        data: { status: 'alive' }
      });

      expect(transactionHandler).not.toHaveBeenCalled();
    });

    it('should handle malformed messages gracefully', () => {
      const transactionHandler = vi.fn();
      p2pNode.on('transaction:received', transactionHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      // Simulate receiving malformed data
      expect(() => dataHandler(null)).not.toThrow();
      expect(() => dataHandler(undefined)).not.toThrow();
      expect(() => dataHandler('invalid')).not.toThrow();
      expect(() => dataHandler({})).not.toThrow();

      expect(transactionHandler).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should destroy peer connection on cleanup', () => {
      p2pNode.destroy();
      
      expect(mockPeer.destroy).toHaveBeenCalledTimes(1);
    });

    it('should handle destroy when already destroyed', () => {
      mockPeer.destroyed = true;
      
      expect(() => p2pNode.destroy()).not.toThrow();
    });
  });

  describe('connection management', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should track connected peers', () => {
      expect(p2pNode.getConnectedPeers()).toEqual([]);
      
      // Simulate connection
      p2pNode.connectToPeer('peer1');
      
      // Simulate connection open
      const dataOpenHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      
      dataOpenHandler();
      
      expect(p2pNode.getConnectedPeers()).toContain('test-peer-id');
    });

    it('should remove peers when connection closes', () => {
      // Connect and open
      p2pNode.connectToPeer('peer1');
      const dataOpenHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      dataOpenHandler();
      
      expect(p2pNode.getConnectedPeers()).toContain('test-peer-id');
      
      // Simulate connection close
      const dataCloseHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'close'
      )?.[1];
      dataCloseHandler();
      
      expect(p2pNode.getConnectedPeers()).not.toContain('test-peer-id');
    });
  });

  describe('candidate block broadcasting', () => {
    let mockDataConnection2: any;

    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
      
      // Create a second mock connection for testing multiple peers
      mockDataConnection2 = {
        on: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        peer: 'test-peer-id-2',
        open: true
      };
      
      // Mock the connect method to return different connections
      let connectionCount = 0;
      mockPeer.connect = vi.fn(() => {
        connectionCount++;
        return connectionCount === 1 ? mockDataConnection : mockDataConnection2;
      });
      
      // Set up first connection
      p2pNode.connectToPeer('peer1');
      
      // Simulate the first connection opening
      const openHandler1 = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler1) {
        openHandler1();
      }
      
      // Set up second connection
      p2pNode.connectToPeer('peer2');
      
      // Simulate the second connection opening
      const openHandler2 = mockDataConnection2.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler2) {
        openHandler2();
      }
    });

    it('should broadcast a candidate block to all connected peers', () => {
      const mockBlock: Block = {
        id: 'block-123',
        previousHash: '0'.repeat(64),
        transactions: [],
        timestamp: Date.now(),
        signature: 'block-signature',
        publicKey: 'block-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        attestations: [] // Empty for candidate block
      } as Block;

      p2pNode.broadcastCandidateBlock(mockBlock);

      // Should send to both connections: 1 call for peer list (on open) + 1 call for candidate block
      expect(mockDataConnection.send).toHaveBeenCalledTimes(2);
      expect(mockDataConnection2.send).toHaveBeenCalledTimes(2);
      
      // Check that candidate block was sent (should be the second call, after peer list)
      expect(mockDataConnection.send).toHaveBeenNthCalledWith(2, {
        type: 'CANDIDATE_BLOCK_PROPOSAL',
        data: mockBlock
      });
      expect(mockDataConnection2.send).toHaveBeenNthCalledWith(2, {
        type: 'CANDIDATE_BLOCK_PROPOSAL',
        data: mockBlock
      });
    });

    it('should not broadcast candidate block if no connections exist', () => {
      // Clear previous mock calls 
      vi.clearAllMocks();
      
      // Create a new isolated mock for this test
      const isolatedMockPeer = {
        id: 'isolated-peer-id',
        on: vi.fn(),
        connect: vi.fn(),
        destroy: vi.fn(),
        open: true,
        connections: {},
        disconnected: false,
        destroyed: false
      };
      
      MockedPeer.mockReturnValueOnce(isolatedMockPeer);
      
      const p2pNodeIsolated = new P2PNode(mockKeyPair);
      
      const mockBlock = {
        id: 'block-123',
        previousHash: '0'.repeat(64),
        transactions: [],
        timestamp: Date.now(),
        signature: 'block-signature',
        publicKey: 'block-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        attestations: []
      } as Block;

      p2pNodeIsolated.broadcastCandidateBlock(mockBlock);

      // Since there are no connections, send should not be called at all on any mock connection
      expect(mockDataConnection.send).not.toHaveBeenCalled();
      expect(mockDataConnection2.send).not.toHaveBeenCalled();
    });

    it('should handle broadcast errors gracefully', () => {
      mockDataConnection.send.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const mockBlock = {
        id: 'block-123',
        previousHash: '0'.repeat(64),
        transactions: [],
        timestamp: Date.now(),
        signature: 'block-signature',
        publicKey: 'block-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        attestations: []
      } as Block;

      // Should not throw
      expect(() => p2pNode.broadcastCandidateBlock(mockBlock)).not.toThrow();
    });
  });

  describe('attestation broadcasting', () => {
    let mockDataConnection2: any;

    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
      
      // Create a second mock connection for testing multiple peers
      mockDataConnection2 = {
        on: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        peer: 'test-peer-id-2',
        open: true
      };
      
      // Mock the connect method to return different connections
      let connectionCount = 0;
      mockPeer.connect = vi.fn(() => {
        connectionCount++;
        return connectionCount === 1 ? mockDataConnection : mockDataConnection2;
      });
      
      // Set up first connection
      p2pNode.connectToPeer('peer1');
      
      // Simulate the first connection opening
      const openHandler1 = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler1) {
        openHandler1();
      }
      
      // Set up second connection
      p2pNode.connectToPeer('peer2');
      
      // Simulate the second connection opening
      const openHandler2 = mockDataConnection2.on.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      if (openHandler2) {
        openHandler2();
      }
    });

    it('should broadcast an attestation to all connected peers', () => {
      const mockAttestation: Attestation = {
        attesterPublicKey: 'attester-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        signature: 'attestation-signature'
      };

      p2pNode.broadcastAttestation(mockAttestation);

      // Should send to both connections: 1 call for peer list (on open) + 1 call for attestation
      expect(mockDataConnection.send).toHaveBeenCalledTimes(2);
      expect(mockDataConnection2.send).toHaveBeenCalledTimes(2);
      
      // Check that attestation was sent (should be the second call, after peer list)
      expect(mockDataConnection.send).toHaveBeenNthCalledWith(2, {
        type: 'ATTESTATION_BROADCAST',
        data: mockAttestation
      });
      expect(mockDataConnection2.send).toHaveBeenNthCalledWith(2, {
        type: 'ATTESTATION_BROADCAST',
        data: mockAttestation
      });
    });

    it('should not broadcast attestation if no connections exist', () => {
      // Clear previous mock calls 
      vi.clearAllMocks();
      
      // Create a new isolated mock for this test
      const isolatedMockPeer = {
        id: 'isolated-peer-id',
        on: vi.fn(),
        connect: vi.fn(),
        destroy: vi.fn(),
        open: true,
        connections: {},
        disconnected: false,
        destroyed: false
      };
      
      MockedPeer.mockReturnValueOnce(isolatedMockPeer);
      
      const p2pNodeIsolated = new P2PNode(mockKeyPair);
      
      const mockAttestation: Attestation = {
        attesterPublicKey: 'attester-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        signature: 'attestation-signature'
      };

      p2pNodeIsolated.broadcastAttestation(mockAttestation);

      // Since there are no connections, send should not be called at all on any mock connection
      expect(mockDataConnection.send).not.toHaveBeenCalled();
      expect(mockDataConnection2.send).not.toHaveBeenCalled();
    });

    it('should handle broadcast errors gracefully', () => {
      mockDataConnection.send.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const mockAttestation: Attestation = {
        attesterPublicKey: 'attester-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        signature: 'attestation-signature'
      };

      // Should not throw
      expect(() => p2pNode.broadcastAttestation(mockAttestation)).not.toThrow();
    });
  });

  describe('candidate block receiving', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should emit "candidate-block:received" event upon receiving a candidate block', () => {
      const mockBlock = {
        id: 'block-123',
        previousHash: '0'.repeat(64),
        transactions: [],
        timestamp: Date.now(),
        signature: 'block-signature',
        publicKey: 'block-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        attestations: []
      } as Block;

      const candidateBlockHandler = vi.fn();
      p2pNode.on('candidate-block:received', candidateBlockHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler that was registered
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      expect(dataHandler).toBeDefined();

      // Simulate receiving candidate block data
      dataHandler({
        type: 'CANDIDATE_BLOCK_PROPOSAL',
        data: mockBlock
      });

      expect(candidateBlockHandler).toHaveBeenCalledTimes(1);
      expect(candidateBlockHandler).toHaveBeenCalledWith(mockBlock);
    });

    it('should ignore non-candidate-block messages', () => {
      const candidateBlockHandler = vi.fn();
      p2pNode.on('candidate-block:received', candidateBlockHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      // Simulate receiving non-candidate-block data
      dataHandler({
        type: 'transaction',
        data: { id: 'tx-123' }
      });

      expect(candidateBlockHandler).not.toHaveBeenCalled();
    });
  });

  describe('attestation receiving', () => {
    beforeEach(() => {
      p2pNode = new P2PNode(mockKeyPair);
    });

    it('should emit "attestation:received" event upon receiving an attestation', () => {
      const mockAttestation: Attestation = {
        attesterPublicKey: 'attester-public-key',
        puzzleId: 'puzzle-123',
        proposedAnswer: 'answer-abc',
        signature: 'attestation-signature'
      };

      const attestationHandler = vi.fn();
      p2pNode.on('attestation:received', attestationHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler that was registered
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      expect(dataHandler).toBeDefined();

      // Simulate receiving attestation data
      dataHandler({
        type: 'ATTESTATION_BROADCAST',
        data: mockAttestation
      });

      expect(attestationHandler).toHaveBeenCalledTimes(1);
      expect(attestationHandler).toHaveBeenCalledWith(mockAttestation);
    });

    it('should ignore non-attestation messages', () => {
      const attestationHandler = vi.fn();
      p2pNode.on('attestation:received', attestationHandler);

      // Simulate receiving a connection
      const connectionHandler = mockPeer.on.mock.calls.find(
        call => call[0] === 'connection'
      )?.[1];
      
      connectionHandler(mockDataConnection);

      // Get the data handler
      const dataHandler = mockDataConnection.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      // Simulate receiving non-attestation data
      dataHandler({
        type: 'transaction',
        data: { id: 'tx-123' }
      });

      expect(attestationHandler).not.toHaveBeenCalled();
    });
  });
}); 