import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AttestationView } from './AttestationView';
import type { QuizQuestion } from '@apstat-chain/data';

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
      isEligibleToAttest: vi.fn().mockReturnValue(true)
    };

    const user = userEvent.setup();

    // Act
    render(<AttestationView candidates={mockCandidates} questions={mockQuestions} service={mockService} />);

    // The component should display the candidate block
    // Find the multiple-choice button for the same answer as the proposedAnswer (i.e., the "C" button)
    const cButton = screen.getByRole('button', { name: 'C' });
    await user.click(cButton);

    // After selecting the matching answer, find and click the "Attest to This Block" button
    const attestButton = screen.getByRole('button', { name: 'Attest to This Block' });
    await user.click(attestButton);

    // Assert
    // Verify that mockService.submitAttestation was called exactly one time
    expect(mockService.submitAttestation).toHaveBeenCalledTimes(1);
    
    // Verify that it was called with the correct arguments: the block and the attester answer
    expect(mockService.submitAttestation).toHaveBeenCalledWith(mockCandidateBlock, 'C');
  });

  it('should disable the attest button for the block\'s creator', async () => {
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
      isEligibleToAttest: vi.fn().mockReturnValue(false)
    };

    const user = userEvent.setup();

    // Act
    render(<AttestationView candidates={mockCandidates} questions={mockQuestions} service={mockService} />);

    // Select an answer
    const cButton = screen.getByRole('button', { name: 'C' });
    await user.click(cButton);

    // Find the attest button
    const attestButton = screen.getByRole('button', { name: 'You cannot attest to your own block' });

    // Assert
    // Verify that the button is disabled
    expect(attestButton).toBeDisabled();
    
    // Verify it shows the correct text
    expect(attestButton).toHaveTextContent('You cannot attest to your own block');
    
    // Verify that isEligibleToAttest was called
    expect(mockService.isEligibleToAttest).toHaveBeenCalledWith(mockCandidateBlock);
  });
}); 