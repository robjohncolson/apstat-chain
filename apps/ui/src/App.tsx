import { useEffect } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { useBlockchain } from './providers/BlockchainProvider';

// Dashboard wrapper component that handles P2P initialization
function DashboardWithP2P() {
  // The `service` object is now stable and will not change between renders.
  const { service } = useBlockchain();

  useEffect(() => {
    const initP2P = async () => {
      try {
        console.log('Initializing P2P...');
        const peerId = await service.initializeP2P();
        console.log('P2P initialized with Peer ID:', peerId);

        console.log('Discovering and connecting to peers...');
        const discoveredPeers = await service.discoverPeers();
        const otherPeers = discoveredPeers.filter(p => p !== peerId);
        
        console.log('Found other peers:', otherPeers);
        otherPeers.forEach(p => service.connectToPeer(p));

      } catch (error) {
        console.error('Failed during P2P setup:', error);
      }
    };

    initP2P();

    // The dependency array now contains `service`, which is guaranteed to be stable.
    // This effect will run ONLY ONCE when the component mounts.
  }, [service]);

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
    const savedMnemonic = localStorage.getItem('apstat-mnemonic');
    if (savedMnemonic) {
      console.log('Found saved mnemonic, restoring wallet...');
      service.restoreWallet(savedMnemonic).catch(err => {
        console.error("Failed to restore wallet, clearing saved mnemonic.", err);
        localStorage.removeItem('apstat-mnemonic');
      });
    }
  }, [service]); // Depends only on the stable service instance.

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