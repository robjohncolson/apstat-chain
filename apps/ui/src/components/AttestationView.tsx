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

  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">No Blocks to Review</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check back later for new candidate blocks to validate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {candidates.map((candidate) => {
        // Find the matching question using the block's puzzleId
        const questionObject = questions.find(q => q.id.toString() === candidate.block.puzzleId);
        const userSelectedAnswer = selectedAnswers.get(candidate.block.id);
        const isMinerCurrentUser = isCurrentUserMiner(candidate.block);
        
        return (
          <div key={candidate.block.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            {/* Block Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                    Candidate Block
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-300">
                    Puzzle ID: {candidate.block.puzzleId}
                  </p>
                </div>
                {isMinerCurrentUser && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                    Your Block
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Question Image */}
              {questionObject ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <img 
                    src={questionObject.questionImage} 
                    alt={`Question ${candidate.block.puzzleId}`}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                  />
                </div>
              ) : candidate.block.puzzleId ? (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                      Question not found for puzzle ID: {candidate.block.puzzleId}
                    </p>
                  </div>
                </div>
              ) : null}
            
              {/* Miner's Proposed Answer */}
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Miner's Proposed Answer
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {candidate.block.proposedAnswer}
                    </p>
                  </div>
                  <div className="text-3xl text-blue-600 dark:text-blue-400">
                    📝
                  </div>
                </div>
              </div>
            
              {/* User Answer Selection */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🗳️</span>
                  Cast your vote:
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {answerChoices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleAnswerSelect(candidate.block.id, choice)}
                      disabled={isMinerCurrentUser}
                      className={`aspect-square flex items-center justify-center font-bold text-lg rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswers.get(candidate.block.id) === choice
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105'
                          : isMinerCurrentUser
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                {isMinerCurrentUser && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    You cannot vote on your own proposed block
                  </p>
                )}
              </div>
              
              {/* Attestation Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleAttest(candidate.block)}
                  disabled={isButtonDisabled(candidate.block, userSelectedAnswer)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isButtonDisabled(candidate.block, userSelectedAnswer)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {isAttestationLoading(candidate.block) && (
                    <LoadingSpinner size="sm" />
                  )}
                  <span>
                    {isAttestationLoading(candidate.block) ? 'Submitting Vote...' : getButtonText(candidate.block)}
                  </span>
                  {!isButtonDisabled(candidate.block, userSelectedAnswer) && !isAttestationLoading(candidate.block) && (
                    <span className="text-lg">🗳️</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 