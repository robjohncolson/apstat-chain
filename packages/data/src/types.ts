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

// === NEW V2 CURRICULUM DATA STRUCTURE (ADR 021) ===

/**
 * Base interface for all activity types with completion tracking
 */
export interface ActivityBase {
  completed: boolean;
  completionDate: string | null;
}

/**
 * Video activity with primary and backup URLs
 */
export interface VideoActivity extends ActivityBase {
  url: string;                 // Primary AP Classroom URL
  altUrl: string | null;       // Backup Google Drive URL
}

/**
 * Quiz activity with PDF resources
 */
export interface QuizActivity extends ActivityBase {
  questionPdf?: string;        // Path to quiz questions (optional)
  answersPdf: string;          // Path to answer key (required)
  quizId: string;              // Unique identifier
}

/**
 * Blooket game activity
 */
export interface BlooketActivity extends ActivityBase {
  url: string;                 // Blooket game set URL
}

/**
 * Origami creative hands-on activity
 */
export interface OrigamiActivity {
  name: string;                // Activity name
  description: string;         // Brief description
  videoUrl: string;            // Instruction video URL
  reflection: string;          // Reflection prompt
}

/**
 * A curriculum topic with all associated learning activities
 */
export interface CurriculumTopic {
  id: string;                  // "1-1", "1-2", "1-capstone"
  name: string;                // "Topic 1.1"
  description: string;         // Full topic description
  videos: VideoActivity[];     // Primary instructional content
  quizzes: QuizActivity[];     // Assessment materials
  blooket: BlooketActivity;    // Game-based reinforcement
  origami: OrigamiActivity;    // Creative hands-on activity
  isCapstone?: boolean;        // Unit-level assessment flag
  current: boolean;            // Navigation state
}

/**
 * A curriculum unit containing multiple topics
 */
export interface CurriculumUnit {
  unitId: string;              // "unit1", "unit2", etc.
  displayName: string;         // "Unit 1: Exploring One-Variable Data"
  examWeight: string;          // "15-23%" (AP exam weighting)
  topics: CurriculumTopic[];
}

/**
 * Completion statistics for progress tracking
 */
export interface CompletionStats {
  videos: {
    completed: number;
    total: number;
    percentage: number;
  };
  quizzes: {
    completed: number;
    total: number;
    percentage: number;
  };
  blookets: {
    completed: number;
    total: number;
    percentage: number;
  };
  overall: {
    completed: number;
    total: number;
    percentage: number;
  };
}

/**
 * Total count of all activities across the curriculum
 */
export interface TotalCounts {
  videos: number;
  quizzes: number;
  blookets: number;
} 