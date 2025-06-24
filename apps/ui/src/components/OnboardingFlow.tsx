import { useState } from 'react'
import { useBlockchain } from '../providers/BlockchainProvider'

interface OnboardingFlowProps {
  onLogin: () => void
}

export function OnboardingFlow({ onLogin }: OnboardingFlowProps) {
  const { generateNewWallet } = useBlockchain()
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateAccount = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      const result = await generateNewWallet()
      setMnemonic(result.mnemonic)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate wallet')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinue = () => {
    onLogin()
  }

  const renderMnemonicWords = (mnemonic: string) => {
    const words = mnemonic.split(' ')
    return words.map((word, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <span className="text-sm font-medium text-gray-500">{index + 1}</span>
        <span className="font-mono text-lg font-semibold text-gray-900">{word}</span>
      </div>
    ))
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to APStat Chain</h1>
        <p className="text-gray-600">Create your new blockchain account to get started</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!mnemonic ? (
        <div className="text-center">
          <button
            onClick={handleGenerateAccount}
            disabled={isGenerating}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate New Account'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Recovery Phrase</h2>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Important:</strong> Write down these 12 words in order and store them safely. 
                You'll need them to recover your account if you lose access.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {renderMnemonicWords(mnemonic)}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedSaved}
                onChange={(e) => setHasConfirmedSaved(e.target.checked)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">I have saved my phrase</span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!hasConfirmedSaved}
              className="w-full px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 