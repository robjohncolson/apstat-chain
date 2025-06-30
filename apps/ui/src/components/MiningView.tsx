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

  if (!currentPuzzle) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800 rounded-full flex items-center justify-center">
          <span className="text-3xl">⛏️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ready to Mine?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get a puzzle to start mining and propose a new block
        </p>
        <button
          onClick={handleGetPuzzle}
          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Mining Puzzle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Puzzle Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              Mining Puzzle #{currentPuzzle.id}
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-300">
              Solve this puzzle to propose a new block
            </p>
          </div>
          <div className="text-2xl">🧩</div>
        </div>
      </div>

      {/* Question Image */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <img
          src={currentPuzzle.questionImage}
          alt={`Question ${currentPuzzle.id}`}
          className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
        />
      </div>

      {/* Answer Choices */}
      <div>
        <p className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">✏️</span>
          Select your answer:
        </p>
        <div className="grid grid-cols-5 gap-3">
          {['A', 'B', 'C', 'D', 'E'].map((choice) => (
            <button
              key={choice}
              onClick={() => handleAnswerSelect(choice)}
              className={`aspect-square flex items-center justify-center font-bold text-xl rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === choice
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-emerald-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Propose Block Button */}
        <button
          onClick={handleProposeBlock}
          disabled={!selectedAnswer || isProposeBlockLoading()}
          className={`w-full py-4 px-8 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            selectedAnswer && !isProposeBlockLoading()
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {isProposeBlockLoading() && (
            <LoadingSpinner size="sm" />
          )}
          <span>
            {isProposeBlockLoading() ? 'Proposing Block...' : 'Propose Block'}
          </span>
          {selectedAnswer && !isProposeBlockLoading() && (
            <span className="text-xl">⛏️</span>
          )}
        </button>

        {/* Get New Puzzle Button */}
        <button
          onClick={handleGetPuzzle}
          disabled={isProposeBlockLoading()}
          className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
        >
          Get New Puzzle
        </button>
      </div>
    </div>
  );
} 