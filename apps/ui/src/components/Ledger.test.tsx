import { render, screen } from '@testing-library/react';
import { Ledger } from './Ledger';
import type { Transaction } from '@apstat-chain/core';
import '@testing-library/jest-dom';

describe('Ledger', () => {
  it('should render transactions correctly', () => {
    // 1. Define mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: 'tx123456789012345678901234567890',
        authorPublicKey: { hex: 'ALICE_PUBLIC_KEY_123456789', bytes: new Uint8Array() },
        timestamp: 1234567890000,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: { r: 123n, s: 456n }
      },
      {
        id: 'tx789012345678901234567890123456',
        authorPublicKey: { hex: 'BOB_PUBLIC_KEY_ABCDEFGHIJK', bytes: new Uint8Array() },
        timestamp: 1234567895000,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-2-quiz' },
        signature: { r: 789n, s: 101112n }
      }
    ];

    // 2. Render the component with mock transactions
    render(<Ledger transactions={mockTransactions} />);

    // 3. Assert that the transaction data is visible
    expect(screen.getByText('Global Ledger (2 transactions)')).toBeInTheDocument();
    
    // Check that transaction IDs are visible (truncated)
    expect(screen.getByText('tx12345678901234...')).toBeInTheDocument();
    expect(screen.getByText('tx78901234567890...')).toBeInTheDocument();
    
    // Check that author public keys are visible (truncated)
    expect(screen.getByText('ALICE_PUBLIC_KEY...')).toBeInTheDocument();
    expect(screen.getByText('BOB_PUBLIC_KEY_A...')).toBeInTheDocument();
    
    // Check that payload data is visible
    expect(screen.getAllByText(/"type": "LESSON_COMPLETE"/)).toHaveLength(2);
    expect(screen.getByText(/"lessonId": "unit-1-quiz"/)).toBeInTheDocument();
    expect(screen.getByText(/"lessonId": "unit-2-quiz"/)).toBeInTheDocument();
  });

  it('should display empty state when no transactions', () => {
    // 1. Render with empty transactions array
    render(<Ledger transactions={[]} />);

    // 2. Assert empty state is shown
    expect(screen.getByText('Global Ledger (0 transactions)')).toBeInTheDocument();
    expect(screen.getByText('No transactions yet. Complete a lesson to see your first transaction!')).toBeInTheDocument();
  });
}); 