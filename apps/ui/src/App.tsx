import { OnboardingFlow } from './components/OnboardingFlow'
import { useBlockchain } from './providers/BlockchainProvider'

// Placeholder Dashboard component
function Dashboard() {
  const { state, getMnemonic } = useBlockchain()
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to APStat Chain Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your wallet is initialized and ready to use!
        </p>
        {state.currentKeyPair && (
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✅ Wallet initialized successfully
            </p>
                         <p className="text-green-700 dark:text-green-300 text-xs mt-1">
               Public Key: {state.currentKeyPair.publicKey.hex.slice(0, 16)}...
             </p>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const { state, restoreWallet } = useBlockchain()

  const handleLogin = async () => {
    try {
      // Get the mnemonic from the blockchain service
      const mnemonic = state.mnemonic
      
      if (mnemonic) {
        // Persist mnemonic in localStorage
        localStorage.setItem('apstat-mnemonic', mnemonic)
        
        // The wallet is already initialized through the OnboardingFlow's generateNewWallet call,
        // so we don't need to call restoreWallet here. The state.isInitialized should already be true.
        console.log('Mnemonic persisted successfully')
      }
    } catch (error) {
      console.error('Failed to persist mnemonic:', error)
    }
  }

  // Check if there's a saved mnemonic on app startup and restore wallet if needed
  // This would typically be done in a useEffect, but for this MVP we'll keep it simple
  
  // Conditional rendering based on wallet initialization status
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <OnboardingFlow onLogin={handleLogin} />
      </div>
    )
  }

  return <Dashboard />
}

export default App
