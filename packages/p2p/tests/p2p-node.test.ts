import type { Transaction } from '@apstat-chain/core';
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
      p2pNode = new P2PNode();
      
      expect(MockedPeer).toHaveBeenCalledTimes(1);
      expect(mockPeer.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockPeer.on).toHaveBeenCalledWith('connection', expect.any(Function));
      expect(mockPeer.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should initialize with custom peer ID if provided', () => {
      const customId = 'custom-peer-id';
      p2pNode = new P2PNode(customId);
      
      expect(MockedPeer).toHaveBeenCalledWith(customId);
    });

    it('should initialize without peer ID to get random ID', () => {
      p2pNode = new P2PNode();
      
      expect(MockedPeer).toHaveBeenCalledWith(undefined);
    });
  });

  describe('peer connections', () => {
    beforeEach(() => {
      p2pNode = new P2PNode();
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
      p2pNode = new P2PNode();
      
      expect(p2pNode.getPeerId()).toBeNull();
    });
  });

  describe('transaction broadcasting', () => {
    let mockDataConnection2: any;

    beforeEach(() => {
      p2pNode = new P2PNode();
      
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
        authorPublicKey: {
          bytes: new Uint8Array([1, 2, 3]),
          hex: '010203'
        },
        id: 'transaction-123',
        signature: {
          r: BigInt('12345'),
          s: BigInt('67890')
        }
      };

      p2pNode.broadcastTransaction(mockTransaction);

      // Should send to both connections
      expect(mockDataConnection.send).toHaveBeenCalledTimes(1);
      expect(mockDataConnection2.send).toHaveBeenCalledTimes(1);
      expect(mockDataConnection.send).toHaveBeenCalledWith({
        type: 'transaction',
        data: mockTransaction
      });
      expect(mockDataConnection2.send).toHaveBeenCalledWith({
        type: 'transaction',
        data: mockTransaction
      });
    });

    it('should not broadcast if no connections exist', () => {
      const p2pNodeIsolated = new P2PNode();
      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        authorPublicKey: {
          bytes: new Uint8Array([1, 2, 3]),
          hex: '010203'
        },
        id: 'transaction-123',
        signature: {
          r: BigInt('12345'),
          s: BigInt('67890')
        }
      };

      p2pNodeIsolated.broadcastTransaction(mockTransaction);

      expect(mockDataConnection.send).not.toHaveBeenCalled();
    });

    it('should handle broadcast errors gracefully', () => {
      mockDataConnection.send.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        authorPublicKey: {
          bytes: new Uint8Array([1, 2, 3]),
          hex: '010203'
        },
        id: 'transaction-123',
        signature: {
          r: BigInt('12345'),
          s: BigInt('67890')
        }
      };

      // Should not throw
      expect(() => p2pNode.broadcastTransaction(mockTransaction)).not.toThrow();
    });
  });

  describe('transaction receiving', () => {
    beforeEach(() => {
      p2pNode = new P2PNode();
    });

    it('should emit "transaction:received" event upon receiving a transaction', () => {
      const mockTransaction: Transaction = {
        payload: { action: 'transfer', amount: 100 },
        timestamp: Date.now(),
        authorPublicKey: {
          bytes: new Uint8Array([1, 2, 3]),
          hex: '010203'
        },
        id: 'transaction-123',
        signature: {
          r: BigInt('12345'),
          s: BigInt('67890')
        }
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
      p2pNode = new P2PNode();
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
      p2pNode = new P2PNode();
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
}); 