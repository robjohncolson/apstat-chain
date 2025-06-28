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

// Re-export all types
export * from './types.js'; 