import { useEffect } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { useBlockchain } from './providers/BlockchainProvider';

// Dashboard wrapper component that handles P2P initialization
function DashboardWithP2P() {
  const { service, state } = useBlockchain();

  useEffect(() => {
    // This function will only run if the P2P node isn't already set up.
    if (state.p2pNode) {
      return;
    }

    const initP2P = async () => {
      try {
        console.log('Initializing P2P...');
        const peerId = await service.initializeP2P();
        console.log('P2P initialized with Peer ID:', peerId);

        // --- THIS IS THE NEW LOGIC ---
        // Check the URL for a peer to connect to.
        const urlParams = new URLSearchParams(window.location.search);
        const bootstrapPeer = urlParams.get('connect_to');

        let peersToConnect: string[] = [];

        if (bootstrapPeer) {
          console.log('Found bootstrap peer in URL:', bootstrapPeer);
          peersToConnect = [bootstrapPeer];
        } else {
          // This is where you would normally use DNS discovery.
          // For now, it will be empty if no ?connect_to= is present.
          console.log('No bootstrap peer in URL. Acting as a seed node.');
          // peersToConnect = await service.discoverPeers(); // DNS logic would go here
        }
        
        const otherPeers = peersToConnect.filter(p => p !== peerId);
        
        if (otherPeers.length > 0) {
          console.log('Connecting to peers:', otherPeers);
          otherPeers.forEach(p => service.connectToPeer(p));
        } else {
          console.log('No other peers to connect to.');
        }

      } catch (error) {
        console.error('Failed during P2P setup:', error);
      }
    };

    initP2P();

  }, [service, state.p2pNode]); // This will now run only once.

  return <Dashboard />;
}

function App() {
  // The hook now returns the stable service and the reactive state
  const { service, state } = useBlockchain();

  const handleLogin = async () => {
    try {
      // Get the mnemonic directly from the service state
      const mnemonic = service.getMnemonic();
      
      if (mnemonic) {
        localStorage.setItem('apstat-mnemonic', mnemonic);
        console.log('Mnemonic persisted successfully');
      }
    } catch (error) {
      console.error('Failed to persist mnemonic:', error);
    }
  };

  // We add a startup effect to check for a saved wallet
  useEffect(() => {
    // Only attempt wallet restore if wallet isn't already initialized
    if (!state.isInitialized) {
      const savedMnemonic = localStorage.getItem('apstat-mnemonic');
      if (savedMnemonic) {
        console.log('Found saved mnemonic, restoring wallet...');
        try {
          service.restoreWallet(savedMnemonic);
        } catch (error) {
          console.error('Failed to restore wallet, clearing saved mnemonic:', error);
          localStorage.removeItem('apstat-mnemonic');
        }
      }
    }
  }, [service, state.isInitialized]); // Depends on the stable service instance and initialization state

  // Conditional rendering based on wallet initialization status
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <OnboardingFlow onLogin={handleLogin} />
      </div>
    );
  }

  return <DashboardWithP2P />;
}

export default App;