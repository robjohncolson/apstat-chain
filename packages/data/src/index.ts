import { Lesson, QuizQuestion } from './types.js';
import lessonsData from './lessons_export.json' with { type: 'json' };
import questionsData from './questions_export.json' with { type: 'json' };

/**
 * All lessons data typed as Lesson array
 */
export const ALL_LESSONS: Lesson[] = lessonsData as Lesson[];

/**
 * All questions data typed as QuizQuestion array
 */
export const ALL_QUESTIONS: QuizQuestion[] = questionsData as QuizQuestion[];

// === CORE CURRICULUM DATA (Battle-tested V1) ===

// Export curriculum data access
export { ALL_UNITS_DATA } from './curriculumData.js';

// === V2 CURRICULUM MANAGER (ADR 021) ===

// Export the CurriculumManager service
export { CurriculumManager } from './CurriculumManager.js';

// Export all types for use by UI components
export type {
  // Core data types
  CurriculumUnit,
  CurriculumTopic,
  VideoActivity,
  QuizActivity,
  BlooketActivity,
  OrigamiActivity,
  TotalCounts,
  CompletionStats,
  
  // Legacy types
  QuizQuestion,
  Lesson,
  
  // Phase 2 blockchain integration types
  ActivityCompletionTransaction,
  BlockchainIntegration
} from './types.js'; 