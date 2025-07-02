import React, { useEffect, useState, useRef } from 'react';
import { gateway } from '@apstat-chain/core';
import type { CurriculumUnit } from '@apstat-chain/data';
import BlockchainService, { type BlockchainState } from '@/services/BlockchainService';
import { P2PNode } from '@apstat-chain/p2p';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicCard } from '@/components/TopicCard';
import { OverallProgressTab } from '@/components/OverallProgressTab';
import { GrokPromptTab } from '@/components/GrokPromptTab';

function App() {
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const blockchainService = useRef<BlockchainService | null>(null);

  const [, setForceUpdate] = useState(0);
  const handleUpdate = () => setForceUpdate(val => val + 1);

  // This effect runs once to initialize the entire application backend
  useEffect(() => {
    console.log('APP_INIT: Initializing BlockchainService...');
    
    // Get the singleton instance of BlockchainService
    const service = BlockchainService.getInstance();
    blockchainService.current = service;

    // Initialize the Gateway with the live service instance
    gateway.initializeGateway(service);

    // Set up a listener to see new transactions in the console
    service.subscribe((state: BlockchainState) => {
      if (state.lastEvent && state.lastEvent.type === 'TRANSACTION_MINED') {
        console.log('APP_LISTENER: New transaction mined!', state.lastEvent.data);
      }
    });

    console.log('APP_INIT: Backend services initialized.');

    // Now fetch the static curriculum data
    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        const data = await gateway.getCurriculumData();
        setUnits(data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
    
  }, []); // The empty array [] ensures this runs only once

  const renderUnitContent = (unit: CurriculumUnit) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {unit.topics.map(topic => (
        <TopicCard key={topic.id} unitId={unit.unitId} topic={topic} onUpdate={handleUpdate} />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">APStat Chain</h1>
        <p className="text-slate-600">The decentralized learning platform for AP Statistics.</p>
      </header>
      
      {isLoading ? (
        <p>Loading curriculum...</p>
      ) : (
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
      )}
    </div>
  );
}

export default App;