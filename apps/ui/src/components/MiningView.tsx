import { useState } from 'react';
import type { QuizQuestion } from '@apstat-chain/data';

interface MiningViewProps {
  service: {
    getMiningPuzzle(): QuizQuestion;
    proposeBlock(params: { puzzleId: string; proposedAnswer: string }): void;
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
              disabled={!selectedAnswer}
              className={`py-3 px-8 rounded-lg font-semibold transition-colors ${
                selectedAnswer
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Propose Block
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