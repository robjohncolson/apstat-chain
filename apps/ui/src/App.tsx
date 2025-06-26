import { useEffect, useState } from 'react'; // <-- Import useState
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { Ledger } from './components/Ledger';
import { Leaderboard } from './components/Leaderboard';
import { useBlockchain } from './providers/BlockchainProvider';

// Dashboard wrapper component that handles P2P initialization
function DashboardWithP2P() {
  const { service, state } = useBlockchain();

  useEffect(() => {
    // This function will only run if the P2P node isn't already set up.
    if (state.p2pNode) {
      return;
    }

    // Only initialize P2P if we have a currentKeyPair
    if (!state.currentKeyPair) {
      return;
    }

    const initP2P = async () => {
      try {
        console.log('Initializing P2P...');
        const peerId = await service.initializeP2P(state.currentKeyPair!);
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

  }, [service, state.p2pNode, state.currentKeyPair]); // Added state.currentKeyPair to dependencies

  const handleCompleteLesson = (lessonId: string) => {
    service.createTransaction({
      type: 'LESSON_COMPLETE',
      lessonId: lessonId
    });
  };

  const handleMinePendingTransactions = () => {
    try {
      service.minePendingTransactions();
    } catch (error) {
      console.error('Failed to mine pending transactions:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Dashboard
        publicKey={state.currentKeyPair?.publicKey || null}
        peerId={state.peerId}
        connectedPeers={state.connectedPeers}
        isConnecting={state.isConnecting}
        error={state.error}
        onCompleteLesson={handleCompleteLesson}
        onMinePendingTransactions={handleMinePendingTransactions}
        pendingTransactionsCount={state.pendingTransactions.length}
      />
      <div className="max-w-4xl mx-auto px-4">
        <Ledger transactions={service.getTransactions()} />
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <Leaderboard transactions={service.getTransactions()} />
      </div>
    </div>
  );
}
function App() {
  const { service, state } = useBlockchain();
  // ADD A LOADING STATE: This will help us manage the initial startup check.
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (mnemonic: string) => {
    localStorage.setItem('apstat-mnemonic', mnemonic);
    console.log('Mnemonic persisted successfully');
    service.restoreWallet(mnemonic);
  };

  // Session persistence: Check for saved wallet on startup
  useEffect(() => {
    const restoreSession = async () => {
      const savedMnemonic = localStorage.getItem('apstat-mnemonic');
      
      // We only try to restore if there's a mnemonic and the wallet isn't already initialized.
      if (savedMnemonic && !service.getState().isInitialized) {
        console.log('Found saved mnemonic, restoring wallet...');
        try {
          await service.restoreWallet(savedMnemonic);
        } catch (error) {
          console.error('Failed to restore wallet, clearing saved mnemonic:', error);
          localStorage.removeItem('apstat-mnemonic');
        }
      }
      // CRITICAL: After the check is complete, we set loading to false.
      setIsLoading(false);
    };

    restoreSession();
  }, [service]); // This effect should only run ONCE.

  // While we're checking localStorage, show a simple loading indicator.
  if (isLoading) {
    return <div className="min-h-screen bg-gray-900" />; // Or a proper spinner
  }

  // After loading, check the initialized state to decide what to render.
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