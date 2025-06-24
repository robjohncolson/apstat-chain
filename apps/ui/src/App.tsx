import { useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { OnboardingFlow } from './components/OnboardingFlow'
import { useBlockchain } from './providers/BlockchainProvider'

// Dashboard wrapper component that handles P2P initialization
function DashboardWithP2P() {
  const { initializeP2P, discoverPeers, connectToPeer, state } = useBlockchain()

  // Function to discover and connect to peers
  const discoverAndConnectToPeers = async () => {
    try {
      console.log('Discovering peers...')
      const discoveredPeers = await discoverPeers()
      console.log('Discovered peers:', discoveredPeers)
      
      // Filter out our own peer ID to avoid self-connection
      const otherPeers = discoveredPeers.filter(peerId => peerId !== state.peerId)
      console.log('Connecting to other peers:', otherPeers)
      
      // Connect to each discovered peer
      for (const peerId of otherPeers) {
        try {
          await connectToPeer(peerId)
          console.log(`Successfully connected to peer: ${peerId}`)
        } catch (error) {
          console.error(`Failed to connect to peer ${peerId}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to discover peers:', error)
    }
  }

  useEffect(() => {
    // Initialize P2P networking when Dashboard is first rendered
    const initP2P = async () => {
      try {
        await initializeP2P()
        console.log('P2P network initialized successfully')
        
        // After successful P2P initialization, discover and connect to peers
        await discoverAndConnectToPeers()
      } catch (error) {
        console.error('Failed to initialize P2P network:', error)
      }
    }

    initP2P()
  }, [initializeP2P])

  return <Dashboard onDiscoverPeers={discoverAndConnectToPeers} />
}

function App() {
  const { state } = useBlockchain()

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

  return <DashboardWithP2P />
}

export default App
