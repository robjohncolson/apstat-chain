import { useState } from 'react';
import type { QuizQuestion } from '@apstat-chain/data';
import { LoadingSpinner } from './LoadingSpinner';

interface MiningViewProps {
  service: {
    getMiningPuzzle(): QuizQuestion;
    proposeBlock(params: { puzzleId: string; proposedAnswer: string }): void;
    isActionPending(actionId: string): boolean;
  };
}

export function MiningView({ service }: MiningViewProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleGetPuzzle = () => {
    const puzzle = service.getMiningPuzzle();
    setCurrentPuzzle(puzzle);
    setSelectedAnswer(null); // Reset selected answer when getting new puzzle
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleProposeBlock = () => {
    if (currentPuzzle && selectedAnswer) {
      service.proposeBlock({
        puzzleId: currentPuzzle.id.toString(),
        proposedAnswer: selectedAnswer
      });
    }
  };

  // Helper function to check if block proposal is loading
  const isProposeBlockLoading = (): boolean => {
    return currentPuzzle ? service.isActionPending(`PROPOSE_BLOCK_${currentPuzzle.id}`) : false;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mining View</h2>
      
      {!currentPuzzle ? (
        <div className="text-center">
          <button
            onClick={handleGetPuzzle}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Get Puzzle
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Image */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <img
              src={currentPuzzle.questionImage}
              alt={`Question ${currentPuzzle.id}`}
              className="max-w-full h-auto mx-auto"
            />
          </div>

          {/* Answer Choices */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Select your answer:</h3>
            <div className="grid grid-cols-5 gap-3">
              {['A', 'B', 'C', 'D', 'E'].map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(choice)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedAnswer === choice
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          {/* Propose Block Button */}
          <div className="text-center">
            <button
              onClick={handleProposeBlock}
              disabled={!selectedAnswer || isProposeBlockLoading()}
              className={`py-3 px-8 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto ${
                selectedAnswer && !isProposeBlockLoading()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProposeBlockLoading() && (
                <LoadingSpinner size="sm" />
              )}
              {isProposeBlockLoading() ? 'Proposing Block...' : 'Propose Block'}
            </button>
          </div>

          {/* Get New Puzzle Button */}
          <div className="text-center">
            <button
              onClick={handleGetPuzzle}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Get New Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 