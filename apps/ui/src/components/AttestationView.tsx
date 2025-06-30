import React, { useState } from 'react';
import type { Block } from '@apstat-chain/core';
import type { QuizQuestion } from '@apstat-chain/data';
import { useBlockchain } from '../providers/BlockchainProvider';
import { LoadingSpinner } from './LoadingSpinner';

interface AttestationViewProps {
  candidates: { block: Block; isEligible: boolean; }[];
  questions: QuizQuestion[];
}

export const AttestationView: React.FC<AttestationViewProps> = ({ candidates, questions }) => {
  const { service, state } = useBlockchain();
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());

  // Extract current user identity from state - the source of truth
  const currentUserPublicKey = state.currentKeyPair?.publicKey.hex;

  const handleAnswerSelect = (blockId: string, answer: string) => {
    setSelectedAnswers(prev => new Map(prev).set(blockId, answer));
  };

  const handleAttest = (block: Block) => {
    const userSelectedAnswer = selectedAnswers.get(block.id);
    if (userSelectedAnswer) {
      service.submitAttestation(block, userSelectedAnswer);
    }
  };

  // Helper function to determine if current user mined the block
  const isCurrentUserMiner = (block: Block): boolean => {
    return currentUserPublicKey === block.publicKey;
  };

  // Helper function to get appropriate button text
  const getButtonText = (block: Block): string => {
    if (isCurrentUserMiner(block)) {
      return 'You cannot vote on your own block';
    }
    if (!service.isEligibleToAttest(block)) {
      return 'Complete related lessons to cast your vote';
    }
    return 'Cast My Vote';
  };

  // Helper function to determine if button should be disabled
  const isButtonDisabled = (block: Block, userSelectedAnswer: string | undefined): boolean => {
    const isLoading = service.isActionPending(`SUBMIT_ATTESTATION_${block.id}`);
    return !userSelectedAnswer || !service.isEligibleToAttest(block) || isCurrentUserMiner(block) || isLoading;
  };

  // Helper function to check if attestation is loading
  const isAttestationLoading = (block: Block): boolean => {
    return service.isActionPending(`SUBMIT_ATTESTATION_${block.id}`);
  };

  const answerChoices = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Block Attestation</h1>
      
      {candidates.map((candidate) => {
        // Find the matching question using the block's puzzleId
        const questionObject = questions.find(q => q.id.toString() === candidate.block.puzzleId);
        const userSelectedAnswer = selectedAnswers.get(candidate.block.id);
        const isMinerCurrentUser = isCurrentUserMiner(candidate.block);
        
        return (
          <div key={candidate.block.id} className="border border-gray-300 rounded-lg p-6 mb-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Candidate Block</h2>
            
            {/* Question Image */}
            {questionObject ? (
              <div className="mb-4">
                <img 
                  src={questionObject.questionImage} 
                  alt={`Question ${candidate.block.puzzleId}`}
                  className="max-w-full h-auto border border-gray-200 rounded"
                />
              </div>
            ) : candidate.block.puzzleId ? (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">
                  Question not found for puzzle ID: {candidate.block.puzzleId}
                </p>
              </div>
            ) : null}
          
          {/* Miner's Proposed Answer */}
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">
              Miner's Proposed Answer: <span className="font-bold">{candidate.block.proposedAnswer}</span>
              {isMinerCurrentUser && (
                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  Your Block
                </span>
              )}
            </p>
          </div>
          
          {/* User Answer Selection */}
          <div className="mb-4">
            <p className="font-medium mb-3">Select your answer:</p>
            <div className="flex gap-2">
              {answerChoices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(candidate.block.id, choice)}
                  disabled={isMinerCurrentUser}
                  className={`px-4 py-2 border rounded font-medium transition-colors ${
                    selectedAnswers.get(candidate.block.id) === choice
                      ? 'bg-blue-500 text-white border-blue-500'
                      : isMinerCurrentUser
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
          
            {/* Attestation Button */}
            <button
              onClick={() => handleAttest(candidate.block)}
              disabled={isButtonDisabled(candidate.block, userSelectedAnswer)}
              className={`px-6 py-2 rounded font-medium transition-colors flex items-center gap-2 ${
                !isButtonDisabled(candidate.block, userSelectedAnswer)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAttestationLoading(candidate.block) && (
                <LoadingSpinner size="sm" />
              )}
              {isAttestationLoading(candidate.block) ? 'Submitting Vote...' : getButtonText(candidate.block)}
            </button>
          </div>
        );
      })}
      
      {candidates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No candidate blocks available for attestation.
        </div>
      )}
    </div>
  );
}; 