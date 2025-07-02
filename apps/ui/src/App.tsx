import React, { useEffect, useState, useRef } from 'react';
import { gateway } from '@apstat-chain/core';
import type { CurriculumUnit } from '@apstat-chain/data';
import BlockchainService, { type BlockchainState } from '@/services/BlockchainService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicCard } from '@/components/TopicCard';
import { OverallProgressTab } from '@/components/OverallProgressTab';
import { GrokPromptTab } from '@/components/GrokPromptTab';
import { Onboarding } from '@/components/Onboarding';

// Define our main application states
type AppState = 'initializing' | 'onboarding' | 'dashboard';

// A simple component to represent the main dashboard
const Dashboard = ({ units }: { units: CurriculumUnit[] }) => {
  const [, setForceUpdate] = useState(0);
  const handleUpdate = () => setForceUpdate(val => val + 1);

  const renderUnitContent = (unit: CurriculumUnit) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {unit.topics.map(topic => (
        <TopicCard key={topic.id} unitId={unit.unitId} topic={topic} onUpdate={handleUpdate} />
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="study-materials" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="study-materials">Study Materials</TabsTrigger>
        <TabsTrigger value="grok-prompt">Grok Prompt</TabsTrigger>
        <TabsTrigger value="overall-progress">Overall Progress</TabsTrigger>
      </TabsList>
      <TabsContent value="study-materials" className="mt-4">
        <Tabs defaultValue="unit1" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 md:grid-cols-9">
            {units.map(unit => (
              <TabsTrigger key={unit.unitId} value={unit.unitId}>Unit {unit.unitId.replace('unit', '')}</TabsTrigger>
            ))}
          </TabsList>
          {units.map(unit => (
            <TabsContent key={unit.unitId} value={unit.unitId} className="mt-4">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-1">{unit.displayName}</h2>
                <p className="text-sm text-slate-500 mb-4">Exam Weight: {unit.examWeight}</p>
                {renderUnitContent(unit)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
      <TabsContent value="grok-prompt" className="mt-4">
        <GrokPromptTab units={units} onUpdate={handleUpdate} />
      </TabsContent>
      <TabsContent value="overall-progress" className="mt-4">
        <OverallProgressTab />
      </TabsContent>
    </Tabs>
  );
};

function App() {
  const [appState, setAppState] = useState<AppState>('initializing');
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const blockchainService = useRef<BlockchainService | null>(null);

  // This function will be called by the Onboarding component
  const handleWalletInitialized = async (mnemonic: string) => {
    console.log('APP_CONTROLLER: Wallet phrase received. Initializing backend services...');
    localStorage.setItem('apstat-mnemonic', mnemonic); // Persist mnemonic for future sessions

    // Initialize core services now that we have a wallet
    const service = BlockchainService.getInstance();
    blockchainService.current = service;
    
    // Initialize the wallet with the provided mnemonic
    try {
      await service.restoreWallet(mnemonic);
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      // If restoration fails, generate a new wallet from the mnemonic
      await service.generateNewWallet();
    }

    // This is the new "rehydration" step - load the chain from storage
    // @ts-ignore - Accessing private method for initialization purposes
    service.loadChainFromStorage();

    // Initialize the Gateway with the live service instance
    gateway.initializeGateway(service);

    // Set up a listener to see new transactions in the console
    service.subscribe((state: BlockchainState) => {
      if (state.lastEvent && state.lastEvent.type === 'TRANSACTION_MINED') {
        console.log('APP_LISTENER: New transaction mined!', state.lastEvent.data);
      }
    });
    
    // Fetch curriculum data and switch to the dashboard
    try {
      const data = await gateway.getCurriculumData();
      setUnits(data);
      setAppState('dashboard');
    } catch (error) {
      console.error('Failed to fetch curriculum data:', error);
    }
  };

  // This effect runs only once on startup to check for a saved wallet
  useEffect(() => {
    const savedMnemonic = localStorage.getItem('apstat-mnemonic');
    if (savedMnemonic) {
      // If we find a mnemonic, initialize the app with it
      handleWalletInitialized(savedMnemonic);
    } else {
      // Otherwise, show the onboarding screen
      setAppState('onboarding');
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'onboarding':
        return <Onboarding onWalletInitialized={handleWalletInitialized} />;
      case 'dashboard':
        return <Dashboard units={units} />;
      case 'initializing':
      default:
        return <p>Initializing Application...</p>;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">APStat Chain</h1>
        <p className="text-slate-600">The decentralized learning platform for AP Statistics.</p>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;