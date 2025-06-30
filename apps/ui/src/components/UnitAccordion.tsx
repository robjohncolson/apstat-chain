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

  // Calculate completion stats for each unit
  const getUnitStats = (unitLessons: EnrichedLesson[]) => {
    const totalActivities = unitLessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
    const completedActivities = unitLessons.reduce((sum, lesson) => 
      sum + lesson.activities.filter(activity => activity.completed).length, 0
    );
    return { total: totalActivities, completed: completedActivities };
  };

  // Sort units numerically (assuming unit IDs like "unit-1", "unit-2", etc.)
  const sortedUnitIds = Object.keys(unitGroups).sort((a, b) => {
    const aNum = parseInt(a.replace('unit-', ''));
    const bNum = parseInt(b.replace('unit-', ''));
    return aNum - bNum;
  });

  if (sortedUnitIds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Progress Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete some lessons to start tracking your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Learning Progress
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your journey through AP Statistics
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
              Overall Progress
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {sortedUnitIds.length} units available
            </p>
          </div>
          <div className="text-3xl">📊</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedUnitIds.slice(0, 3).map((unitId, index) => {
            const stats = getUnitStats(unitGroups[unitId]);
            const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            const unitNumber = unitId.replace('unit-', '');
            
            return (
              <div key={unitId} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Unit {unitNumber}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{stats.completed}/{stats.total}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Units */}
      <div className="space-y-4">
        {sortedUnitIds.map((unitId) => {
          const isExpanded = expandedUnits.has(unitId);
          const unitNumber = unitId.replace('unit-', '');
          const stats = getUnitStats(unitGroups[unitId]);
          const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          
          return (
            <div key={unitId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleUnit(unitId)}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      {progress === 100 ? '✓' : unitNumber}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Unit {unitNumber}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.completed} of {stats.total} activities completed
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          progress === 100 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : progress > 0 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {progress.toFixed(0)}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Progress ring */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${progress}, 100`}
                          className={progress === 100 ? 'text-green-500' : progress > 0 ? 'text-blue-500' : 'text-gray-400'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Expand/collapse icon */}
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="p-6 bg-gray-50 dark:bg-gray-900 space-y-4">
                    {unitGroups[unitId].map((lesson) => (
                      <LessonItem key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 