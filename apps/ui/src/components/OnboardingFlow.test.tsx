import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from './OnboardingFlow';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Create a mock that can be dynamically updated
const mockGenerateNewWallet = vi.fn();

vi.mock('../providers/BlockchainProvider', () => ({
  useBlockchain: () => ({
    service: {
      generateNewWallet: mockGenerateNewWallet,
    },
  }),
}));

describe('OnboardingFlow', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockGenerateNewWallet.mockReset();
  });

  it('should display the mnemonic phrase and confirmation step after generation', async () => {
    // Mock the service to return a known mnemonic
    const knownMnemonic = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    mockGenerateNewWallet.mockResolvedValue({
      mnemonic: knownMnemonic,
      keyPair: { publicKey: 'mock-public-key', privateKey: 'mock-private-key' },
    });

    // Render the OnboardingFlow
    render(<OnboardingFlow onLogin={vi.fn()} />);

    // Simulate a click on the "Generate New Account" button
    fireEvent.click(screen.getByText('Generate New Account'));

    // Wait for and assert that the mnemonic phrase is now visible on the screen
    await waitFor(() => {
      expect(screen.getByText('Your Recovery Phrase')).toBeInTheDocument();
    });

    // Assert that the "Continue" button is now visible but disabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();
  });

  it('should call onLogin with the correct mnemonic upon completion', async () => {
    // Mock the service to return a known mnemonic
    const knownMnemonic = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    mockGenerateNewWallet.mockResolvedValue({
      mnemonic: knownMnemonic,
      keyPair: { publicKey: 'mock-public-key', privateKey: 'mock-private-key' },
    });

    // Create a mock function for the onLogin prop
    const onLogin = vi.fn();

    // Render the OnboardingFlow
    render(<OnboardingFlow onLogin={onLogin} />);

    // Simulate a click on the "Generate New Account" button
    fireEvent.click(screen.getByText('Generate New Account'));

    // Wait for and assert that the mnemonic phrase is now visible on the screen
    await waitFor(() => {
      expect(screen.getByText('Your Recovery Phrase')).toBeInTheDocument();
    });

    // Assert that the "Continue" button is now visible but disabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();

    // Simulate a click on the "I have saved my phrase" checkbox
    fireEvent.click(screen.getByLabelText('I have saved my phrase'));

    // Simulate a click on the "Continue" button
    fireEvent.click(screen.getByText('Continue'));

    // Assert that the onLogin prop was called exactly once, and was called with the known mnemonic string
    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith(knownMnemonic);
  });
});