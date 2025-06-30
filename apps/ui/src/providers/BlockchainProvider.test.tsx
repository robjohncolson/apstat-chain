import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlockchainProvider, useBlockchain } from './BlockchainProvider';
import type { BlockchainState, BlockchainStateListener } from '../services/BlockchainService';

// Mock the BlockchainService
vi.mock('../services/BlockchainService', () => {
  const mockServiceInstance = {
    subscribe: vi.fn(),
    getState: vi.fn(),
    getTransactions: vi.fn(() => []),
  };

  const mockBlockchainService = {
    getInstance: vi.fn(() => mockServiceInstance),
  };

  return {
    default: mockBlockchainService,
  };
});

describe('BlockchainProvider', () => {
  let capturedListener: BlockchainStateListener | null = null;
  let mockServiceInstance: any;

  // Test component that uses the useBlockchain hook
  const TestComponent = () => {
    const { service } = useBlockchain();
    return <div>Count: {service.getTransactions().length}</div>;
  };

  beforeEach(async () => {
    // Reset the captured listener
    capturedListener = null;

    // Get the mocked service instance
    const { default: BlockchainService } = await import('../services/BlockchainService');
    mockServiceInstance = BlockchainService.getInstance();

    // Setup mock implementations
    mockServiceInstance.subscribe.mockImplementation((listener: BlockchainStateListener) => {
      // Capture the listener function that the provider passes to the service
      capturedListener = listener;
      // Return an unsubscribe function
      return vi.fn();
    });

    mockServiceInstance.getState.mockReturnValue({
      isInitialized: false,
      currentKeyPair: null,
      mnemonic: null,
      p2pNode: null,
      peerId: null,
      connectedPeers: [],
      blockchain: {} as any,
      pendingTransactions: [],
      candidateBlocks: new Map(),
      allTransactions: [],
      lastBlockMiner: null,
      lastEvent: null,
      pendingActions: new Set(),
      isConnecting: false,
      error: null,
    } as BlockchainState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should re-render component when service state changes', async () => {
    // Render the test component inside the BlockchainProvider
    const { getByText } = render(
      <BlockchainProvider>
        <TestComponent />
      </BlockchainProvider>
    );

    // Initially, should display "Count: 0" (empty transactions array)
    expect(getByText('Count: 0')).toBeInTheDocument();

    // Verify that the service.subscribe was called and we captured the listener
    expect(mockServiceInstance.subscribe).toHaveBeenCalledTimes(1);
    expect(capturedListener).not.toBeNull();

    // Now, manually call the captured listener function with a new state
    // where transactions array has one item
    const newState: BlockchainState = {
      isInitialized: false,
      currentKeyPair: null,
      mnemonic: null,
      p2pNode: null,
      peerId: null,
      connectedPeers: [],
      blockchain: {} as any,
      pendingTransactions: [],
      candidateBlocks: new Map(),
      allTransactions: [{ id: 'test-tx-1' } as any], // One transaction
      lastBlockMiner: null,
      lastEvent: null,
      pendingActions: new Set(),
      isConnecting: false,
      error: null,
    };

    // Trigger the state change by calling the captured listener
    if (capturedListener) {
      capturedListener(newState);
    }

    // Wait for the component to re-render and assert the new state
    await waitFor(() => {
      expect(getByText('Count: 1')).toBeInTheDocument();
    });
  });
}); 