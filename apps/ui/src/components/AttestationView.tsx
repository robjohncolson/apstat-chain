import React, { useState } from 'react';
import type { Block } from '@apstat-chain/core';
import type { QuizQuestion } from '@apstat-chain/data';

interface AttestationViewProps {
  candidateBlocks: Block[];
  questions: QuizQuestion[];
  service: {
    submitAttestation(block: Block, attesterAnswer: string): void;
  };
}

export const AttestationView: React.FC<AttestationViewProps> = ({ candidateBlocks, questions, service }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());

  const handleAnswerSelect = (blockId: string, answer: string) => {
    setSelectedAnswers(prev => new Map(prev).set(blockId, answer));
  };

  const handleAttest = (block: Block) => {
    const userSelectedAnswer = selectedAnswers.get(block.id);
    if (userSelectedAnswer) {
      service.submitAttestation(block, userSelectedAnswer);
    }
  };

  const answerChoices = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Block Attestation</h1>
      
      {candidateBlocks.map((block) => {
        // Find the matching question using the block's puzzleId
        const questionObject = questions.find(q => q.id.toString() === block.puzzleId);
        const userSelectedAnswer = selectedAnswers.get(block.id);
        
        return (
          <div key={block.id} className="border border-gray-300 rounded-lg p-6 mb-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Candidate Block</h2>
            
            {/* Question Image */}
            {questionObject ? (
              <div className="mb-4">
                <img 
                  src={questionObject.questionImage} 
                  alt={`Question ${block.puzzleId}`}
                  className="max-w-full h-auto border border-gray-200 rounded"
                />
              </div>
            ) : block.puzzleId ? (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">
                  Question not found for puzzle ID: {block.puzzleId}
                </p>
              </div>
            ) : null}
          
          {/* Miner's Proposed Answer */}
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">
              Miner's Proposed Answer: <span className="font-bold">{block.proposedAnswer}</span>
            </p>
          </div>
          
          {/* User Answer Selection */}
          <div className="mb-4">
            <p className="font-medium mb-3">Select your answer:</p>
            <div className="flex gap-2">
              {answerChoices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(block.id, choice)}
                  className={`px-4 py-2 border rounded font-medium transition-colors ${
                    selectedAnswers.get(block.id) === choice
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
          
            {/* Attest Button */}
            <button
              onClick={() => handleAttest(block)}
              disabled={!userSelectedAnswer}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                userSelectedAnswer
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Attest to This Block
            </button>
          </div>
        );
      })}
      
      {candidateBlocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No candidate blocks available for attestation.
        </div>
      )}
    </div>
  );
}; 