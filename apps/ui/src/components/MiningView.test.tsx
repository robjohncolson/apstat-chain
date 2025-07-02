import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { MiningView } from './MiningView';
import type { QuizQuestion } from '@apstat-chain/data';

describe('MiningView', () => {
  it('should display a puzzle and call proposeBlock when an answer is submitted', async () => {
    // Arrange
    const mockQuestion: QuizQuestion = {
      id: 123,
      questionImage: 'path/to/image.png',
      year: 2017,
      source: 'AP Statistics Exam',
      linkedLessonIds: ['1-1']
    };

    const mockService = {
      getMiningPuzzle: vi.fn().mockReturnValue(mockQuestion),
      proposeBlock: vi.fn(),
      isActionPending: vi.fn().mockReturnValue(false)
    };

    // Act
    render(<MiningView service={mockService} />);
    
    // Find and click the "Get Mining Puzzle" button
    const getPuzzleButton = screen.getByText('Get Mining Puzzle');
    fireEvent.click(getPuzzleButton);

    // Find and click one of the answer choice buttons (e.g., "C")
    const answerButtonC = screen.getByText('C');
    fireEvent.click(answerButtonC);

    // Find and click the final "Propose Block" button
    const proposeBlockButton = screen.getByText('Propose Block');
    fireEvent.click(proposeBlockButton);

    // Assert
    expect(mockService.proposeBlock).toHaveBeenCalledTimes(1);
    expect(mockService.proposeBlock).toHaveBeenCalledWith({
      puzzleId: '123',
      proposedAnswer: 'C'
    });
  });
}); 