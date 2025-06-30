import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AttestationView } from './AttestationView';
import type { QuizQuestion } from '@apstat-chain/data';

// Mock the useBlockchain hook
vi.mock('../providers/BlockchainProvider', () => ({
  useBlockchain: vi.fn()
}));

import { useBlockchain } from '../providers/BlockchainProvider';

describe('AttestationView', () => {
  it('should display a candidate block and call submitAttestation when the user agrees', async () => {
    // Arrange
    const mockCandidateBlock = {
      id: 'test-block-id',
      previousHash: '0'.repeat(64),
      transactions: [],
      timestamp: Date.now(),
      signature: 'test-signature',
      publicKey: 'test-public-key',
      puzzleId: '2017',
      proposedAnswer: 'C'
    };

    const mockQuestions: QuizQuestion[] = [
      {
        id: 2017,
        questionImage: '/questions/unit1/2017_ap_statistics_mcq9.png',
        year: 2017,
        source: 'AP Statistics MCQ',
        linkedLessonIds: ['1-1']
      }
    ];

    const mockCandidates = [
      {
        block: mockCandidateBlock,
        isEligible: true
      }
    ];

    const mockService = {
      submitAttestation: vi.fn() as any,
      isEligibleToAttest: vi.fn().mockReturnValue(true),
      isActionPending: vi.fn().mockReturnValue(false)
    };

    const mockState = {
      currentKeyPair: {
        publicKey: { hex: 'different-public-key' } // Different from block's public key
      }
    };

    // Mock the useBlockchain hook
    (useBlockchain as any).mockReturnValue({
      service: mockService,
      state: mockState
    });

    const user = userEvent.setup();

    // Act
    render(<AttestationView candidates={mockCandidates} questions={mockQuestions} />);

    // The component should display the candidate block
    // Find the multiple-choice button for the same answer as the proposedAnswer (i.e., the "C" button)
    const cButton = screen.getByRole('button', { name: 'C' });
    await user.click(cButton);

    // After selecting the matching answer, find and click the "Cast My Vote" button
    const attestButton = screen.getByRole('button', { name: 'Cast My Vote' });
    await user.click(attestButton);

    // Assert
    // Verify that mockService.submitAttestation was called exactly one time
    expect(mockService.submitAttestation).toHaveBeenCalledTimes(1);
    
    // Verify that it was called with the correct arguments: the block and the attester answer
    expect(mockService.submitAttestation).toHaveBeenCalledWith(mockCandidateBlock, 'C');
  });

  it('should disable the attest button and answer choices for the block\'s creator', async () => {
    // Arrange
    const mockCandidateBlock = {
      id: 'test-block-id',
      previousHash: '0'.repeat(64),
      transactions: [],
      timestamp: Date.now(),
      signature: 'test-signature',
      publicKey: 'test-public-key',
      puzzleId: '2017',
      proposedAnswer: 'C'
    };

    const mockQuestions: QuizQuestion[] = [
      {
        id: 2017,
        questionImage: '/questions/unit1/2017_ap_statistics_mcq9.png',
        year: 2017,
        source: 'AP Statistics MCQ',
        linkedLessonIds: ['1-1']
      }
    ];

    const mockCandidates = [
      {
        block: mockCandidateBlock,
        isEligible: false
      }
    ];

    const mockService = {
      submitAttestation: vi.fn() as any,
      isEligibleToAttest: vi.fn().mockReturnValue(false),
      isActionPending: vi.fn().mockReturnValue(false)
    };

    const mockState = {
      currentKeyPair: {
        publicKey: { hex: 'test-public-key' } // Same as block's public key
      }
    };

    // Mock the useBlockchain hook
    (useBlockchain as any).mockReturnValue({
      service: mockService,
      state: mockState
    });

    const user = userEvent.setup();

    // Act
    render(<AttestationView candidates={mockCandidates} questions={mockQuestions} />);

    // Find the attest button
    const attestButton = screen.getByRole('button', { name: 'You cannot vote on your own block' });

    // Find answer choice buttons - they should be disabled
    const cButton = screen.getByRole('button', { name: 'C' });

    // Assert
    // Verify that the attest button is disabled
    expect(attestButton).toBeDisabled();
    
    // Verify it shows the correct text
    expect(attestButton).toHaveTextContent('You cannot vote on your own block');
    
    // Verify that answer choice buttons are disabled for the miner
    expect(cButton).toBeDisabled();
    
    // Verify that the "Your Block" indicator is shown
    expect(screen.getByText('Your Block')).toBeInTheDocument();
  });

  it('should show different message when user needs to complete lessons', async () => {
    // Arrange
    const mockCandidateBlock = {
      id: 'test-block-id',
      previousHash: '0'.repeat(64),
      transactions: [],
      timestamp: Date.now(),
      signature: 'test-signature',
      publicKey: 'different-public-key',
      puzzleId: '2017',
      proposedAnswer: 'C'
    };

    const mockQuestions: QuizQuestion[] = [
      {
        id: 2017,
        questionImage: '/questions/unit1/2017_ap_statistics_mcq9.png',
        year: 2017,
        source: 'AP Statistics MCQ',
        linkedLessonIds: ['1-1']
      }
    ];

    const mockCandidates = [
      {
        block: mockCandidateBlock,
        isEligible: false
      }
    ];

    const mockService = {
      submitAttestation: vi.fn() as any,
      isEligibleToAttest: vi.fn().mockReturnValue(false),
      isActionPending: vi.fn().mockReturnValue(false)
    };

    const mockState = {
      currentKeyPair: {
        publicKey: { hex: 'user-public-key' } // Different from block's public key
      }
    };

    // Mock the useBlockchain hook
    (useBlockchain as any).mockReturnValue({
      service: mockService,
      state: mockState
    });

    // Act
    render(<AttestationView candidates={mockCandidates} questions={mockQuestions} />);

    // Find the attest button
    const attestButton = screen.getByRole('button', { name: 'Complete related lessons to cast your vote' });

    // Assert
    expect(attestButton).toBeDisabled();
    expect(attestButton).toHaveTextContent('Complete related lessons to cast your vote');
  });
}); 