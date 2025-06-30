import { render, screen } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import type { Transaction } from '@apstat-chain/core';
import '@testing-library/jest-dom';

describe('Leaderboard', () => {
  it('should calculate and display ranked scores correctly', () => {
    // 1. Define mock transactions with different users and lesson completions
    const mockTransactions: Transaction[] = [
      // User 1 completes 3 unique lessons
      {
        id: 'tx1',
        publicKey: 'USER_1_PUBLIC_KEY',
        timestamp: 1234567890000,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: 'test-signature-1'
      },
      {
        id: 'tx2',
        publicKey: 'USER_1_PUBLIC_KEY',
        timestamp: 1234567890001,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-2-quiz' },
        signature: 'test-signature-2'
      },
      {
        id: 'tx3',
        publicKey: 'USER_1_PUBLIC_KEY',
        timestamp: 1234567890002,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-3-quiz' },
        signature: 'test-signature-3'
      },
      // User 2 completes 2 unique lessons
      {
        id: 'tx4',
        publicKey: 'USER_2_PUBLIC_KEY',
        timestamp: 1234567890003,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: 'test-signature-4'
      },
      {
        id: 'tx5',
        publicKey: 'USER_2_PUBLIC_KEY',
        timestamp: 1234567890004,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-2-quiz' },
        signature: 'test-signature-5'
      },
      // User 2 repeats a lesson (should not count)
      {
        id: 'tx6',
        publicKey: 'USER_2_PUBLIC_KEY',
        timestamp: 1234567890005,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: 'test-signature-6'
      },
      // User 3 completes 1 lesson
      {
        id: 'tx7',
        publicKey: 'USER_3_PUBLIC_KEY',
        timestamp: 1234567890006,
        payload: { type: 'LESSON_COMPLETE', lessonId: 'unit-1-quiz' },
        signature: 'test-signature-7'
      },
      // Non-lesson transaction (should be ignored)
      {
        id: 'tx8',
        publicKey: 'USER_1_PUBLIC_KEY',
        timestamp: 1234567890007,
        payload: { type: 'OTHER_ACTION', data: 'some data' },
        signature: 'test-signature-8'
      }
    ];

    // 2. Render the component with mock transactions
    render(<Leaderboard transactions={mockTransactions} />);

    // 3. Assert that the leaderboard data is correct
    expect(screen.getByText('Leaderboard (3 users)')).toBeInTheDocument();
    
    // Check that users are ranked correctly (User 1 should be rank 1 with 3 lessons)
    expect(screen.getByText('1')).toBeInTheDocument(); // Rank 1
    expect(screen.getByText('USER_1_PUBLIC_KEY')).toBeInTheDocument();
    expect(screen.getByText('3 lessons')).toBeInTheDocument();
    
    // Check rank 2 (User 2 with 2 lessons)
    expect(screen.getByText('2')).toBeInTheDocument(); // Rank 2
    expect(screen.getByText('USER_2_PUBLIC_KEY')).toBeInTheDocument();
    expect(screen.getByText('2 lessons')).toBeInTheDocument();
    
    // Check rank 3 (User 3 with 1 lesson)
    expect(screen.getByText('3')).toBeInTheDocument(); // Rank 3
    expect(screen.getByText('USER_3_PUBLIC_KEY')).toBeInTheDocument();
    expect(screen.getByText('1 lesson')).toBeInTheDocument(); // Singular form
  });

  it('should display empty state when no lesson completions', () => {
    // 1. Define transactions with no lesson completions
    const mockTransactions: Transaction[] = [
      {
        id: 'tx1',
        publicKey: 'USER_1_PUBLIC_KEY',
        timestamp: 1234567890000,
        payload: { type: 'OTHER_ACTION', data: 'some data' },
        signature: 'test-signature-9'
      }
    ];

    // 2. Render with non-lesson transactions
    render(<Leaderboard transactions={mockTransactions} />);

    // 3. Assert empty state is shown
    expect(screen.getByText('Leaderboard (0 users)')).toBeInTheDocument();
    expect(screen.getByText('No lesson completions yet. Complete some lessons to see the leaderboard!')).toBeInTheDocument();
  });

  it('should display empty state when no transactions at all', () => {
    // 1. Render with empty transactions array
    render(<Leaderboard transactions={[]} />);

    // 2. Assert empty state is shown
    expect(screen.getByText('Leaderboard (0 users)')).toBeInTheDocument();
    expect(screen.getByText('No lesson completions yet. Complete some lessons to see the leaderboard!')).toBeInTheDocument();
  });
}); 