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
// === CORE CURRICULUM DATA (Battle-tested V1) ===
// Export curriculum data access
export { ALL_UNITS_DATA } from './curriculumData.js';
// === V2 CURRICULUM MANAGER (ADR 021) ===
// Export the CurriculumManager service
export { CurriculumManager } from './CurriculumManager.js';
