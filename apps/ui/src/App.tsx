import React, { useEffect, useState } from 'react';
import { gateway } from '@apstat-chain/core';
import type { CurriculumUnit } from '@apstat-chain/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicCard } from '@/components/TopicCard';

function App() {
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // A simple way to force re-render when a child component updates state
  const [, setForceUpdate] = useState(0);
  const handleUpdate = () => setForceUpdate(val => val + 1);

  useEffect(() => {
    const fetchLessons = async () => {
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
  }, []);

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
      )}
    </div>
  );
}

export default App;