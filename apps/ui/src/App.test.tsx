import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create mock objects that we can control directly
const mockService = {
  getState: vi.fn(),
  subscribe: vi.fn(),
  restoreWallet: vi.fn(),
  initializeP2P: vi.fn(),
  generateNewWallet: vi.fn(),
  createTransaction: vi.fn(),
};

const mockState = { 
  isInitialized: false,
  currentKeyPair: null,
  mnemonic: null,
  p2pNode: null,
  peerId: null,
  connectedPeers: [],
  transactions: [],
  isConnecting: false,
  error: null
};

// Mock the entire BlockchainService module
vi.mock('@/services/BlockchainService', () => ({
  default: {
    getInstance: vi.fn(() => mockService),
  },
}));

import BlockchainService from '@/services/BlockchainService';
import App from '@/App';

describe('App Session Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset state
    mockState.isInitialized = false;
    mockState.currentKeyPair = null;
    mockState.mnemonic = null;
    mockState.error = null;
    
    // Setup default mock behaviors
    mockService.getState.mockReturnValue(mockState);
    mockService.subscribe.mockReturnValue(() => {});
    
    // Reset localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  it('should show OnboardingFlow when no mnemonic is in localStorage', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    render(<App />);

    // Wait for the loading state to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate new account/i })).toBeInTheDocument();
    });
  });

  it('should restore wallet and show Dashboard when a valid mnemonic is found', async () => {
    const testMnemonic = 'test mnemonic';
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(testMnemonic);
    
    // Mock the restoreWallet to simulate successful restoration
    mockService.restoreWallet.mockResolvedValue({
      publicKey: 'test-key', 
      privateKey: 'test-private'
    });

    render(<App />);

    // Wait for restoration to complete
    await waitFor(() => {
      expect(mockService.restoreWallet).toHaveBeenCalledWith(testMnemonic);
    });
  });
});