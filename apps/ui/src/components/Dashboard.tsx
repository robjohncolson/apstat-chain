import { useState } from 'react'
import type { KeyPair, Transaction } from '@apstat-chain/core'
import { ALL_QUESTIONS } from '@apstat-chain/data'
import { MiningView } from './MiningView'
import { AttestationView } from './AttestationView'
// import { Ledger } from './Ledger' // Unused import
import { Leaderboard } from './Leaderboard'
import { UnitAccordion } from './UnitAccordion'
import { LoadingSpinner } from './LoadingSpinner'
import type BlockchainService from '../services/BlockchainService'
import { useBlockchain } from '../providers/BlockchainProvider'

interface MempoolViewProps {
  transactions: Transaction[]
}

function MempoolView({ transactions }: MempoolViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Transactions
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {transactions.length} pending
        </span>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No pending transactions
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Transaction ID
                  </label>
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                    {tx.id}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Type
                  </label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tx.payload?.type || 'Unknown'}
                  </span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            APStat Chain
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Learn • Mine • Validate • Earn
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
          <nav className="flex">
            {[
              { id: 'activity', label: 'Network Activity', icon: '⚡' },
              { id: 'progress', label: 'My Progress', icon: '📚' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            {/* Hero Status Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Network Progress - Most Important */}
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Network Progress</h2>
                    <p className="text-blue-100">Contributing to collective knowledge</p>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">
                      {pendingTotal.toFixed(2)} / 1.0
                    </span>
                    <span className="text-sm text-blue-100">
                      {((pendingTotal / 1.0) * 100).toFixed(1)}% complete
                    </span>
                  </div>
                  <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
                    <div 
                      className="bg-white bg-opacity-80 h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${Math.min(100, (pendingTotal / 1.0) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {pendingTotal >= 1.0 ? (
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm font-medium">🎉 Ready for mining! Network threshold reached.</p>
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-sm">
                      Need {(1.0 - pendingTotal).toFixed(2)} more contribution to unlock mining
                    </p>
                  </div>
                )}
              </div>

              {/* Connection Status */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Status</h3>
                  <div className={`h-3 w-3 rounded-full ${peerId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isConnecting ? 'Connecting...' : peerId ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected Peers</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {connectedPeers.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mining Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                        ⛏️ Mining Center
                      </h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-300">
                        Propose new blocks to earn rewards
                      </p>
                    </div>
                    {isEligible && pendingTotal >= 1.0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                        Ready to mine
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {pendingTotal >= 1.0 && isEligible ? (
                    <MiningView service={service} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⛏️</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mining Locked</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {pendingTotal < 1.0 
                          ? `Complete ${(1.0 - pendingTotal).toFixed(2)} more lessons to unlock mining`
                          : 'You are not eligible to mine at this time'
                        }
                      </p>
                      <button
                        onClick={() => onCompleteLesson('1-2', '1-2_q1')}
                        disabled={service.isActionPending('CREATE_TRANSACTION_1-2_q1')}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          service.isActionPending('CREATE_TRANSACTION_1-2_q1')
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {service.isActionPending('CREATE_TRANSACTION_1-2_q1') && (
                          <LoadingSpinner size="sm" />
                        )}
                        {service.isActionPending('CREATE_TRANSACTION_1-2_q1') 
                          ? 'Submitting...' 
                          : 'Complete Unit 1 Quiz'
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attestation Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-1">
                        ✅ Validation Center
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Review and validate candidate blocks
                      </p>
                    </div>
                    {candidatesWithEligibility.length > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        {candidatesWithEligibility.length} to review
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto">
                  {candidatesWithEligibility.length > 0 ? (
                    <AttestationView candidates={candidatesWithEligibility} questions={ALL_QUESTIONS} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">No Blocks to Review</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check back later for new candidate blocks to validate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Network Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">👛</span>
                  Wallet Information
                </h3>

                {publicKey ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Public Key
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                      {publicKey.hex}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No wallet connected</p>
                )}
              </div>

              {/* Connected Peers */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🌐</span>
                  Connected Peers
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {connectedPeers.length}
                  </span>
                </h3>

                {connectedPeers.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {connectedPeers.map((peerId, index) => (
                      <div
                        key={peerId}
                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                      >
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all flex-1 mr-2">
                          {peerId}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No peers connected yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mempool */}
            <MempoolView transactions={service.getPendingTransactions()} />

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-6 rounded-2xl">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⚠️</span>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Connection Error
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <UnitAccordion service={service} state={state} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <Leaderboard transactions={service.getConfirmedTransactions()} />
          </div>
        )}
      </div>
    </div>
  )
} 