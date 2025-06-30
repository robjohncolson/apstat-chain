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
        publicKey: 'ALICE_PUBLIC_KEY_123456789',
        timestamp: 1234567890000,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: "1234567890abcdef"
      },
      {
        id: 'tx789012345678901234567890123456',
        publicKey: 'BOB_PUBLIC_KEY_ABCDEFGHIJK',
        timestamp: 1234567895000,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-2-quiz' },
        signature: "test-signature-789"
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

  it('should render a transaction without crashing', () => {
    // Mock transaction using new flat structure
    const mockTransaction = {
      id: 'tx_12345678901234567890123456789012',
      publicKey: '02a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
      signature: '304402201234567890123456789012345678901234567890123456789012345678901234022012345678901234567890123456789012345678901234567890123456789012',
      timestamp: 1234567890000,
      payload: {
        type: 'lesson-completion',
        data: { lessonId: 'lesson-1', score: 85 }
      }
    };

    render(<Ledger transactions={[mockTransaction]} />);
  });
}); 