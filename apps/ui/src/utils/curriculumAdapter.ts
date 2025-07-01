import type { CurriculumUnit, CurriculumTopic } from '@apstat-chain/data';
import type { Lesson, Activity } from '@apstat-chain/data';

interface EnrichedActivity extends Activity {
  completed: boolean;
}

interface EnrichedLesson extends Lesson {
  activities: EnrichedActivity[];
}

/**
 * Converts CurriculumUnits to the legacy Lesson structure for UI compatibility
 * This bridge allows the current UI components to work with the new CurriculumManager data
 */
export function convertUnitsToLessons(units: CurriculumUnit[]): EnrichedLesson[] {
  const lessons: EnrichedLesson[] = [];

  units.forEach(unit => {
    unit.topics.forEach(topic => {
      const activities: EnrichedActivity[] = [];

      // Convert videos to activities
      topic.videos.forEach((video, index) => {
        activities.push({
          id: `${topic.id}_video_${index + 1}`,
          type: 'video',
          title: `Video ${index + 1}`,
          contribution: calculateVideoContribution(topic.videos.length),
          completed: video.completed
        });
      });

      // Convert quizzes to activities
      topic.quizzes.forEach((quiz, index) => {
        activities.push({
          id: quiz.quizId,
          type: 'quiz',
          title: `Quiz: ${topic.name}`,
          contribution: 0.5, // Standard quiz contribution
          completed: quiz.completed
        });
      });

      // Convert blooket to activity
      if (topic.blooket.url) {
        activities.push({
          id: `${topic.id}_blooket`,
          type: 'blooket',
          title: `Blooket: ${topic.name}`,
          contribution: 0.15, // Standard blooket contribution
          completed: topic.blooket.completed
        });
      }

      // Convert origami to activity
      activities.push({
        id: `${topic.id}_origami`,
        type: 'origami',
        title: `Origami: ${topic.origami.name}`,
        contribution: 0.05, // Standard origami contribution
        completed: false // Origami doesn't have completion tracking yet
      });

      // Create the lesson
      const lesson: EnrichedLesson = {
        id: topic.id,
        title: topic.description,
        unitId: unit.unitId,
        activities
      };

      lessons.push(lesson);
    });
  });

  return lessons;
}

/**
 * Calculate contribution value for videos based on total count
 */
function calculateVideoContribution(totalVideos: number): number {
  if (totalVideos === 1) return 0.8; // Single video gets most contribution
  if (totalVideos === 2) return 0.15; // Two videos split the contribution
  if (totalVideos === 3) return 0.1; // Three videos split evenly
  return 0.3 / totalVideos; // More videos get smaller shares
}

/**
 * Parse activity ID to extract unit, topic, and activity info for completion handlers
 */
export function parseActivityId(activityId: string): {
  unitId: string;
  topicId: string;
  activityType: 'video' | 'quiz' | 'blooket' | 'origami';
  activityIndex?: number;
} {
  // Handle different activity ID formats
  if (activityId.includes('_video_')) {
    const [topicId, , indexStr] = activityId.split('_');
    const unitId = `unit${topicId.split('-')[0]}`;
    return {
      unitId,
      topicId,
      activityType: 'video',
      activityIndex: parseInt(indexStr) - 1 // Convert to 0-based index
    };
  }
  
  if (activityId.includes('_blooket')) {
    const topicId = activityId.replace('_blooket', '');
    const unitId = `unit${topicId.split('-')[0]}`;
    return {
      unitId,
      topicId,
      activityType: 'blooket'
    };
  }
  
  if (activityId.includes('_origami')) {
    const topicId = activityId.replace('_origami', '');
    const unitId = `unit${topicId.split('-')[0]}`;
    return {
      unitId,
      topicId,
      activityType: 'origami'
    };
  }
  
  // Handle quiz IDs (format: topicId_q1, topicId_q2, etc.)
  if (activityId.includes('_q')) {
    const [topicId, qPart] = activityId.split('_q');
    const unitId = `unit${topicId.split('-')[0]}`;
    const quizIndex = parseInt(qPart) - 1; // Convert to 0-based index
    return {
      unitId,
      topicId,
      activityType: 'quiz',
      activityIndex: quizIndex
    };
  }

  // Fallback parsing
  throw new Error(`Unable to parse activity ID: ${activityId}`);
}

/**
 * Get unit display name from unit ID
 */
export function getUnitDisplayName(unitId: string, units: CurriculumUnit[]): string {
  const unit = units.find(u => u.unitId === unitId);
  return unit?.displayName || `Unit ${unitId.replace('unit', '')}`;
}

/**
 * Calculate overall progress statistics from lessons
 */
export function calculateProgressStats(lessons: EnrichedLesson[]) {
  const totalActivities = lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
  const completedActivities = lessons.reduce((sum, lesson) => 
    sum + lesson.activities.filter(activity => activity.completed).length, 0
  );

  return {
    total: totalActivities,
    completed: completedActivities,
    percentage: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
  };
} 