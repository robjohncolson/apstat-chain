import { describe, it, expect, vi, beforeEach } from 'vitest';
import { keyPairFromMnemonic, peerIdFromPublicKey } from '@apstat-chain/core';
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
describe('P2PNode', () => {
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
    it('should initialize with a deterministic Peer ID derived from the keypair', async () => {
        // Fixed test mnemonic
        const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        // Generate KeyPair from the fixed mnemonic
        const keyPair = keyPairFromMnemonic(testMnemonic);
        // Calculate the expected Peer ID
        const expectedPeerId = peerIdFromPublicKey(keyPair.publicKey);
        // Instantiate a new P2PNode
        new P2PNode(keyPair);
        // Assert that the Peer constructor was called with the expected deterministic ID
        expect(MockedPeer).toHaveBeenCalledWith(expectedPeerId);
    });
    it.skip('[E2E] should connect and register its deterministic ID with a live server', async () => {
        // Temporarily disable mocking for this test
        vi.doUnmock('peerjs');
        // Re-import P2PNode to get the real implementation
        const { P2PNode } = await import('./p2p-node');
        // Fixed test mnemonic
        const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        // Generate KeyPair from the fixed mnemonic
        const keyPair = keyPairFromMnemonic(testMnemonic);
        // Calculate the expected Peer ID
        const expectedPeerId = peerIdFromPublicKey(keyPair.publicKey);
        // Instantiate a real P2PNode
        const p2pNode = new P2PNode(keyPair);
        // Wait for the 'ready' event with a timeout
        const registeredId = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for ready event - signaling server may not be running'));
            }, 10000); // 10 second timeout
            p2pNode.on('ready', (id) => {
                clearTimeout(timeout);
                resolve(id);
            });
            p2pNode.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
        // Assert that the registered ID matches the expected deterministic ID
        expect(registeredId).toBe(expectedPeerId);
        // Clean up
        p2pNode.destroy();
        // Re-enable mocking for subsequent tests
        vi.doMock('peerjs', () => {
            const mockDataConnection = {
                on: vi.fn(),
                send: vi.fn(),
                close: vi.fn(),
                peer: 'test-peer-id',
                open: true
            };
            const mockPeer = {
                id: null,
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
                    mockPeer.id = id;
                    return mockPeer;
                })
            };
        });
    });
});
//# sourceMappingURL=p2p-node.test.js.map