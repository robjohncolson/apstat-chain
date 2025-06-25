import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlockchainProvider, useBlockchain } from './BlockchainProvider';
import type { BlockchainState, BlockchainStateListener } from '@/services/BlockchainService';

// Mock the BlockchainService
vi.mock('@/services/BlockchainService', () => {
  const mockService = {
    getInstance: vi.fn(),
    subscribe: vi.fn(),
    getState: vi.fn(),
  };

  return {
    default: mockService,
  };
});

describe('BlockchainProvider', () => {
  let mockServiceInstance: any;
  let capturedListener: BlockchainStateListener | null = null;

  // Test component that uses the useBlockchain hook
  const TestComponent = () => {
    const { state } = useBlockchain();
    return <div>Count: {state.transactions.length}</div>;
  };

  beforeEach(async () => {
    // Reset the captured listener
    capturedListener = null;

    // Create a mock service instance
    mockServiceInstance = {
      subscribe: vi.fn((listener: BlockchainStateListener) => {
        // Capture the listener function that the provider passes to the service
        capturedListener = listener;
        // Return an unsubscribe function
        return vi.fn();
      }),
      getState: vi.fn(() => ({
        isInitialized: false,
        currentKeyPair: null,
        mnemonic: null,
        p2pNode: null,
        peerId: null,
        connectedPeers: [],
        transactions: [], // Initially empty
        isConnecting: false,
        error: null,
      } as BlockchainState)),
    };

    // Mock the singleton getInstance method
    const { default: BlockchainService } = await import('@/services/BlockchainService');
    vi.mocked(BlockchainService.getInstance).mockReturnValue(mockServiceInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should re-render component when service state changes', async () => {
    // Render the test component inside the BlockchainProvider
    const { getByText, rerender } = render(
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
      transactions: [{ id: 'test-tx-1' } as any], // One transaction
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