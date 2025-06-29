import { useState, useEffect } from 'react'
import { LessonItem } from './LessonItem'
import type BlockchainService from '../services/BlockchainService'
import type { BlockchainState } from '../services/BlockchainService'
import type { Lesson, Activity } from '@apstat-chain/data'

interface EnrichedActivity extends Activity {
  completed: boolean;
}

interface EnrichedLesson extends Lesson {
  activities: EnrichedActivity[];
}

interface UnitAccordionProps {
  service: BlockchainService;
  state: BlockchainState;
}

export function UnitAccordion({ service, state }: UnitAccordionProps) {
  const [lessons, setLessons] = useState<EnrichedLesson[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.currentKeyPair) {
      const personalProgress = service.getPersonalProgress(state.currentKeyPair.publicKey.hex);
      setLessons(personalProgress as EnrichedLesson[]);
    }
  }, [service, state.currentKeyPair]);

  // Group lessons by unitId
  const unitGroups = lessons.reduce((groups, lesson) => {
    if (!groups[lesson.unitId]) {
      groups[lesson.unitId] = [];
    }
    groups[lesson.unitId].push(lesson);
    return groups;
  }, {} as Record<string, EnrichedLesson[]>);

  const toggleUnit = (unitId: string) => {
    const newExpandedUnits = new Set(expandedUnits);
    if (newExpandedUnits.has(unitId)) {
      newExpandedUnits.delete(unitId);
    } else {
      newExpandedUnits.add(unitId);
    }
    setExpandedUnits(newExpandedUnits);
  };

  // Sort units numerically (assuming unit IDs like "unit-1", "unit-2", etc.)
  const sortedUnitIds = Object.keys(unitGroups).sort((a, b) => {
    const aNum = parseInt(a.replace('unit-', ''));
    const bNum = parseInt(b.replace('unit-', ''));
    return aNum - bNum;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        My Progress
      </h2>

      {sortedUnitIds.map((unitId) => {
        const isExpanded = expandedUnits.has(unitId);
        const unitNumber = unitId.replace('unit-', '');
        
        return (
          <div key={unitId} className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => toggleUnit(unitId)}
              className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg border-b border-gray-200 dark:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Unit {unitNumber}
                </h3>
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  {isExpanded ? '−' : '+'}
                </span>
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-4 space-y-4">
                {unitGroups[unitId].map((lesson) => (
                  <LessonItem key={lesson.id} lesson={lesson} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {sortedUnitIds.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No lessons available. Please check back later.
        </div>
      )}
    </div>
  );
} 