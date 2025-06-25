import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BlockchainService from '@/services/BlockchainService';
import App from '@/App';
import * as BlockchainProvider from '@/providers/BlockchainProvider';

vi.mock('@/services/BlockchainService');

describe('App Session Persistence', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getState: vi.fn().mockReturnValue({ isInitialized: false }),
      subscribe: vi.fn().mockReturnValue(() => {}),
      restoreWallet: vi.fn(),
      initializeP2P: vi.fn(),
    };
    (BlockchainService.getInstance as vi.Mock).mockReturnValue(mockService);
  });

  it('should show OnboardingFlow when no mnemonic is in localStorage', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

    render(<App />);

    expect(screen.getByRole('button', { name: /generate new account/i })).toBeInTheDocument();
  });

  it('should restore wallet and show Dashboard when a valid mnemonic is found', async () => {
    const testMnemonic = 'test mnemonic';
    vi.spyOn(localStorage, 'getItem').mockReturnValue(testMnemonic);
    
    const state = { isInitialized: false };
    const listener = vi.fn();
    
    mockService.getState.mockReturnValue(state);
    mockService.subscribe.mockImplementation((cb) => {
      listener.mockImplementation(cb);
      return () => {};
    });

    mockService.restoreWallet.mockImplementation(async () => {
      state.isInitialized = true;
      listener(state);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
    expect(mockService.restoreWallet).toHaveBeenCalledWith(testMnemonic);
  });
});