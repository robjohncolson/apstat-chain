import { describe, it, vi, beforeEach } from 'vitest';
import { createTransaction, keyPairFromMnemonic, generateMnemonic } from '@apstat-chain/core';
import { P2PNode } from './p2p-node';
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
        id: null, // Will be set dynamically in the test
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
        Peer: vi.fn((id) => {
            mockPeer.id = id; // Use the passed ID
            return mockPeer;
        })
    };
});
// Import the mocked Peer constructor
import { Peer } from 'peerjs';
const MockedPeer = Peer;
describe('P2PNode Integration Tests', () => {
    let mockPeer;
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock peer
        mockPeer = {
            id: null,
            on: vi.fn(),
            connect: vi.fn(() => ({
                on: vi.fn(),
                send: vi.fn(),
                close: vi.fn(),
                peer: 'test-peer-id',
                open: true
            })),
            destroy: vi.fn(),
            open: true,
            connections: {},
            disconnected: false,
            destroyed: false
        };
        MockedPeer.mockImplementation((id) => {
            mockPeer.id = id;
            return mockPeer;
        });
    });
    it('should serialize and deserialize a transaction without crashing', () => {
        // Generate a real KeyPair from a test mnemonic
        const testMnemonic = generateMnemonic();
        const keyPair = keyPairFromMnemonic(testMnemonic);
        // Create a real Transaction using the new flat structure
        const transaction = createTransaction(keyPair.privateKey, {
            type: 'lesson-completion',
            lessonId: 'lesson-1',
            score: 85
        });
        // Instantiate a P2PNode
        const p2pNode = new P2PNode(keyPair);
        // This test will fail with a TypeError because serializeTransaction expects
        // the old nested transaction structure with signature: { r: bigint, s: bigint, recovery?: number }
        // but the new transaction structure has signature as a string
        // The error will occur when broadcastTransaction calls serializeTransaction internally
        p2pNode.broadcastTransaction(transaction);
        // Clean up
        p2pNode.destroy();
    });
});
//# sourceMappingURL=p2p-node-integration.test.js.map