import { useState } from 'react'
import type { KeyPair, Transaction } from '@apstat-chain/core'
import { ALL_QUESTIONS } from '@apstat-chain/data'
import { MiningView } from './MiningView'
import { AttestationView } from './AttestationView'
import { Ledger } from './Ledger'
import { Leaderboard } from './Leaderboard'
import { UnitAccordion } from './UnitAccordion'
import type BlockchainService from '../services/BlockchainService'
import { useBlockchain } from '../providers/BlockchainProvider'

interface MempoolViewProps {
  transactions: Transaction[]
}

function MempoolView({ transactions }: MempoolViewProps) {
  return (
    <div className="bg-orange-50 dark:bg-orange-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-4">
        Mempool ({transactions.length} pending transactions)
      </h2>
      
      {transactions.length === 0 ? (
        <p className="text-orange-700 dark:text-orange-300 text-sm">
          No pending transactions
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-gray-800 p-4 rounded border"
            >
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                    Transaction ID
                  </label>
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                    {tx.id}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                    Payload
                  </label>
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {JSON.stringify(tx.payload, null, 2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface DashboardProps {
  publicKey: KeyPair['publicKey'] | null
  peerId: string | null
  connectedPeers: string[]
  isConnecting: boolean
  error: string | null
  onCompleteLesson: (lessonId: string, activityId: string) => void
  service: BlockchainService
}

export function Dashboard({
  publicKey,
  peerId,
  connectedPeers,
  isConnecting,
  error,
  onCompleteLesson,
  service,
}: DashboardProps) {
  // Tab state management
  const [activeTab, setActiveTab] = useState('activity');

  // Get current network state and reactive blockchain state
  const { state } = useBlockchain();
  const pendingTotal = service.getPendingContributionTotal();
  const isEligible = publicKey ? service.isEligibleToMine(publicKey.hex) : false;
  
  // Convert candidateBlocks Map to array with eligibility for AttestationView
  const candidatesWithEligibility = Array.from(state.candidateBlocks.values()).map(block => ({
    block: block,
    isEligible: service.isEligibleToAttest(block)
  }));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          APStat Chain Dashboard
        </h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              role="tab"
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Network Activity
            </button>
            <button
              role="tab"
              onClick={() => setActiveTab('progress')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Progress
            </button>
            <button
              role="tab"
              onClick={() => setActiveTab('leaderboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  Wallet Information
                </h2>

                {publicKey && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Public Key
                      </label>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-xs break-all">
                        {publicKey.hex}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* P2P Network Information */}
              <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                  P2P Network Status
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Peer ID
                    </label>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-xs">
                      {peerId || 'Not connected'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Network Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          peerId ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                      <span className="text-sm">
                        {isConnecting ? 'Connecting...' : peerId ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Progress */}
            <div className="bg-indigo-50 dark:bg-indigo-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
                Network Progress
              </h2>
              <div className="text-lg font-medium text-indigo-700 dark:text-indigo-300">
                Network Progress: {pendingTotal.toFixed(2)} / 1.0
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (pendingTotal / 1.0) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Lessons Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                Lessons
              </h2>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => onCompleteLesson('1-2', '1-2_q1')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Complete Unit 1 Quiz
                </button>
              </div>
            </div>

            {/* Propose a New Block Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Propose a New Block
              </h2>
              
              {pendingTotal >= 1.0 && isEligible ? (
                <MiningView service={service} />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Mining not available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pendingTotal < 1.0 
                      ? `Need ${(1.0 - pendingTotal).toFixed(2)} more contribution to enable mining`
                      : 'You are not eligible to mine at this time'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Review Candidate Blocks Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Review Candidate Blocks
              </h2>
              <AttestationView candidates={candidatesWithEligibility} questions={ALL_QUESTIONS} />
            </div>

            {/* Mempool Section */}
            <div>
              <MempoolView transactions={service.getPendingTransactions()} />
            </div>

            {/* Connected Peers */}
            <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4">
                Connected Peers ({connectedPeers.length})
              </h2>

              {connectedPeers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {connectedPeers.map((peerId, index) => (
                    <div
                      key={peerId}
                      className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-xs flex items-center justify-between"
                    >
                      <span className="break-all">{peerId}</span>
                      <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-purple-700 dark:text-purple-300 text-sm">
                  No peers connected yet
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <UnitAccordion service={service} state={state} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <Leaderboard transactions={service.getConfirmedTransactions()} />
          </div>
        )}
      </div>
    </div>
  )
} 