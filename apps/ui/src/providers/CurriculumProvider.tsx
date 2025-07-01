import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurriculumManager } from '@apstat-chain/data';
import type { 
  CurriculumUnit, 
  CurriculumTopic, 
  TotalCounts, 
  CompletionStats 
} from '@apstat-chain/data';
import { useBlockchain } from './BlockchainProvider';

interface CurriculumContextType {
  manager: CurriculumManager;
  units: CurriculumUnit[];
  totalCounts: TotalCounts;
  completionStats: CompletionStats;
  isLoading: boolean;
  refreshData: () => void;
  
  // Async completion methods
  markVideoCompleted: (unitId: string, topicId: string, videoIndex: number) => Promise<void>;
  markQuizCompleted: (unitId: string, topicId: string, quizIndex: number) => Promise<void>;
  markBlooketCompleted: (unitId: string, topicId: string) => Promise<void>;
}

const CurriculumContext = createContext<CurriculumContextType | null>(null);

interface CurriculumProviderProps {
  children: React.ReactNode;
}

export function CurriculumProvider({ children }: CurriculumProviderProps) {
  const { service } = useBlockchain();
  const [manager, setManager] = useState<CurriculumManager | null>(null);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [totalCounts, setTotalCounts] = useState<TotalCounts>({ videos: 0, quizzes: 0, blookets: 0 });
  const [completionStats, setCompletionStats] = useState<CompletionStats>({
    videos: { completed: 0, total: 0, percentage: 0 },
    quizzes: { completed: 0, total: 0, percentage: 0 },
    blookets: { completed: 0, total: 0, percentage: 0 },
    overall: { completed: 0, total: 0, percentage: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize CurriculumManager with dependency injection
  useEffect(() => {
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        
        // Create CurriculumManager instance with BlockchainService dependency injection
        const curriculumManager = new CurriculumManager(undefined, service);
        setManager(curriculumManager);
        
        // Load initial data
        const allUnits = curriculumManager.getAllUnits();
        const counts = curriculumManager.getTotalCounts();
        const stats = curriculumManager.getCompletionStats();
        
        setUnits(allUnits);
        setTotalCounts(counts);
        setCompletionStats(stats);
        
        console.log('CurriculumManager initialized successfully');
        console.log('Total counts:', counts);
        console.log('Completion stats:', stats);
        
      } catch (error) {
        console.error('Failed to initialize CurriculumManager:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize when we have the blockchain service
    if (service) {
      initializeManager();
    }
  }, [service]);

  const refreshData = () => {
    if (!manager) return;
    
    const allUnits = manager.getAllUnits();
    const counts = manager.getTotalCounts();
    const stats = manager.getCompletionStats();
    
    setUnits(allUnits);
    setTotalCounts(counts);
    setCompletionStats(stats);
  };

  // Async completion methods that integrate with blockchain
  const markVideoCompleted = async (unitId: string, topicId: string, videoIndex: number) => {
    if (!manager) throw new Error('CurriculumManager not initialized');
    
    try {
      await manager.markVideoCompleted(unitId, topicId, videoIndex);
      refreshData(); // Refresh UI data after completion
      console.log(`Video completed: ${unitId}/${topicId}/${videoIndex}`);
    } catch (error) {
      console.error('Failed to mark video as completed:', error);
      throw error;
    }
  };

  const markQuizCompleted = async (unitId: string, topicId: string, quizIndex: number) => {
    if (!manager) throw new Error('CurriculumManager not initialized');
    
    try {
      await manager.markQuizCompleted(unitId, topicId, quizIndex);
      refreshData(); // Refresh UI data after completion
      console.log(`Quiz completed: ${unitId}/${topicId}/${quizIndex}`);
    } catch (error) {
      console.error('Failed to mark quiz as completed:', error);
      throw error;
    }
  };

  const markBlooketCompleted = async (unitId: string, topicId: string) => {
    if (!manager) throw new Error('CurriculumManager not initialized');
    
    try {
      await manager.markBlooketCompleted(unitId, topicId);
      refreshData(); // Refresh UI data after completion
      console.log(`Blooket completed: ${unitId}/${topicId}`);
    } catch (error) {
      console.error('Failed to mark blooket as completed:', error);
      throw error;
    }
  };

  const contextValue: CurriculumContextType = {
    manager: manager!,
    units,
    totalCounts,
    completionStats,
    isLoading,
    refreshData,
    markVideoCompleted,
    markQuizCompleted,
    markBlooketCompleted
  };

  // Don't render children until manager is initialized
  if (isLoading || !manager) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Initializing Curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <CurriculumContext.Provider value={contextValue}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
} 