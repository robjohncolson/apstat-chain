import type { KeyPair } from '@apstat-chain/core'

interface DashboardProps {
  publicKey: KeyPair['publicKey'] | null
  peerId: string | null
  connectedPeers: string[]
  isConnecting: boolean
  error: string | null
  onCompleteLesson: (lessonId: string) => void
}

export function Dashboard({
  publicKey,
  peerId,
  connectedPeers,
  isConnecting,
  error,
  onCompleteLesson,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          APStat Chain Dashboard
        </h1>

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

        {/* Lessons Section */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            Lessons
          </h2>

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => onCompleteLesson('unit-1-quiz')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Complete Unit 1 Quiz
            </button>
          </div>
        </div>

        {/* Connected Peers */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
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
          <div className="mt-6 bg-red-50 dark:bg-red-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
} 