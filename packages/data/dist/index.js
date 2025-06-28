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
// Re-export all types
export * from './types.js';
