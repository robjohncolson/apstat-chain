import React, { useEffect, useState } from 'react';
import { gateway } from '@apstat-chain/core';
import { CurriculumUnit } from '@apstat-chain/data';

function App() {
  // State to hold our curriculum data
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  // State to handle loading
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the component mounts
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Call the gateway to get data. The UI doesn't know where this comes from.
        const data = await gateway.getCurriculumData();
        setUnits(data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        // Here you would set an error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []); // The empty array [] means this effect runs only once

  return (
    <div className="container mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">APStat Chain - UI Renaissance</h1>
        <p className="text-slate-600">Rebuilding with a clean, decoupled architecture.</p>
      </header>

      <main>
        {isLoading ? (
          <p>Loading curriculum...</p>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Units</h2>
            <ul className="list-disc pl-5 space-y-2">
              {/* We map over the data from the gateway and render a list item for each unit */}
              {units.map((unit) => (
                <li key={unit.unitId} className="text-lg">
                  {unit.displayName} ({unit.examWeight})
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;