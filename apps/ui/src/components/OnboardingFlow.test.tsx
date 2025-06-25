import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should call onLogin when the flow is completed', async () => {
    // Set up the mock for this test
    mockGenerateNewWallet.mockResolvedValue({
      mnemonic: 'test mnemonic phrase a b c d e f g h i j k',
    });

    // 1. Create a mock function for the onLogin prop
    const handleLogin = vi.fn();

    // 2. Render the component
    render(<OnboardingFlow onLogin={handleLogin} />);

    // 3. Simulate clicking "Generate New Account"
    fireEvent.click(screen.getByText('Generate New Account'));

    // Wait for the mnemonic to be displayed
    await screen.findByText('Your Recovery Phrase');

    // 4. Simulate checking the "I have saved my phrase" checkbox
    fireEvent.click(screen.getByLabelText('I have saved my phrase'));

    // 5. Simulate clicking "Continue"
    fireEvent.click(screen.getByText('Continue'));

    // 6. Assert that the onLogin mock function was called
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('should call onLogin with the generated mnemonic when flow is completed', async () => {
    // Set up the mock for this specific test
    mockGenerateNewWallet.mockResolvedValue({
      mnemonic: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
    });

    // 1. Create a mock function for the onLogin prop using vi.fn()
    const onLogin = vi.fn();

    // 2. Render the <OnboardingFlow />, passing the mock onLogin function
    render(<OnboardingFlow onLogin={onLogin} />);

    // 3. Simulate a user clicking "Generate"
    fireEvent.click(screen.getByText('Generate New Account'));

    // Wait for the mnemonic to be displayed
    await screen.findByText('Your Recovery Phrase');

    // Simulate checking the "I have saved" box
    fireEvent.click(screen.getByLabelText('I have saved my phrase'));

    // Simulate clicking "Continue"
    fireEvent.click(screen.getByText('Continue'));

    // 4. Assert that onLogin was called exactly once and with the specific mnemonic
    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
  });
});