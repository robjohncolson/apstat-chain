import lessonsData from './lessons_export.json' with { type: 'json' };
import questionsData from './questions_export.json' with { type: 'json' };
/**
 * All lessons data typed as Lesson array
 */
export const ALL_LESSONS = lessonsData;
/**
 * All questions data typed as QuizQuestion array
 */
export const ALL_QUESTIONS = questionsData;
// === V2 CURRICULUM MANAGER (ADR 021) ===
// Export the CurriculumManager service
export { CurriculumManager } from './CurriculumManager.js';
// Export curriculum data and utilities
export { ALL_UNITS_DATA, getTotalItemCounts } from './curriculumData.js';
// Re-export all types (legacy and new V2 types)
export * from './types.js';
