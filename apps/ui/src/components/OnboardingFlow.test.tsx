import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingFlow } from './OnboardingFlow';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../providers/BlockchainProvider', () => ({
  useBlockchain: () => ({
    service: {
      generateNewWallet: vi.fn().mockResolvedValue({
        mnemonic: 'test mnemonic phrase a b c d e f g h i j k',
      }),
    },
  }),
}));

describe('OnboardingFlow', () => {
  it('should call onLogin when the flow is completed', async () => {
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
});