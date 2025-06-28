/**
 * Represents a quiz question with associated metadata
 */
export interface QuizQuestion {
  /** Unique identifier for the question */
  id: number;
  /** Path to the question image relative to assets/questions */
  questionImage: string;
  /** Year the question was from */
  year: number;
  /** Source description of the question */
  source: string;
  /** Array of lesson IDs that this question is linked to */
  linkedLessonIds: string[];
}

/**
 * Represents an activity within a lesson
 */
export interface Activity {
  /** Unique identifier for the activity */
  id: string;
  /** Type of activity (video, quiz, blooket, origami, etc.) */
  type: string;
  /** Display title for the activity */
  title: string;
  /** Contribution weight of this activity to the lesson (0-1) */
  contribution: number;
}

/**
 * Represents a lesson with its associated activities
 */
export interface Lesson {
  /** Unique identifier for the lesson */
  id: string;
  /** Display title for the lesson */
  title: string;
  /** Unit identifier this lesson belongs to */
  unitId: string;
  /** Array of activities that make up this lesson */
  activities: Activity[];
} 