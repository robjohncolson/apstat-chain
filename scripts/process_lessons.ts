import * as fs from 'fs';
import * as path from 'path';

// Import the data from allUnitsData.js
const { ALL_UNITS_DATA } = require('./allUnitsData.js');

// Type definitions for better TypeScript support
interface Activity {
  id: string;
  type: 'video' | 'quiz' | 'blooket' | 'origami';
  title: string;
  contribution: number;
}

interface Lesson {
  id: string;
  title: string;
  unitId: string;
  activities: Activity[];
}

interface TopicData {
  id: string;
  name: string;
  description: string;
  videos: Array<{
    url: string;
    altUrl?: string;
    completed: boolean;
    completionDate: string | null;
  }>;
  blooket: {
    url: string;
    completed: boolean;
    completionDate: string | null;
  };
  origami: {
    name: string;
    description: string;
    videoUrl: string;
    reflection: string;
  };
  quizzes: Array<{
    questionPdf: string;
    answersPdf: string;
    quizId: string;
    completed: boolean;
    completionDate: string | null;
  }>;
}

interface UnitData {
  unitId: string;
  displayName: string;
  examWeight: string;
  topics: TopicData[];
}

function processLessons(): void {
  const lessons: Lesson[] = [];

  // Iterate through all units and their topics
  ALL_UNITS_DATA.forEach((unit: UnitData) => {
    unit.topics.forEach((topic: TopicData) => {
      // Check if quiz exists to determine weights
      const hasQuiz = topic.quizzes && topic.quizzes.length > 0;
      
      // Define weights based on quiz presence
      const weights = hasQuiz 
        ? { video: 0.3, quiz: 0.5, blooket: 0.15, origami: 0.05 }
        : { video: 0.8, quiz: 0.0, blooket: 0.15, origami: 0.05 };

      const activities: Activity[] = [];

      // Process videos
      if (topic.videos && topic.videos.length > 0) {
        topic.videos.forEach((video, index) => {
          activities.push({
            id: `${topic.id}_video_${index + 1}`,
            type: 'video',
            title: `Video ${index + 1}`,
            contribution: weights.video / topic.videos.length // Distribute weight evenly among videos
          });
        });
      }

      // Process quizzes (only if they exist)
      if (topic.quizzes && topic.quizzes.length > 0) {
        topic.quizzes.forEach((quiz) => {
          activities.push({
            id: quiz.quizId,
            type: 'quiz',
            title: `Quiz: ${topic.name}`,
            contribution: weights.quiz / topic.quizzes.length // Distribute weight evenly among quizzes
          });
        });
      }

      // Process blooket
      if (topic.blooket && topic.blooket.url) {
        activities.push({
          id: `${topic.id}_blooket`,
          type: 'blooket',
          title: `Blooket: ${topic.name}`,
          contribution: weights.blooket
        });
      }

      // Process origami
      if (topic.origami && topic.origami.name) {
        activities.push({
          id: `${topic.id}_origami`,
          type: 'origami',
          title: `Origami: ${topic.origami.name}`,
          contribution: weights.origami
        });
      }

      // Create the lesson object
      const lesson: Lesson = {
        id: topic.id,
        title: topic.description,
        unitId: unit.unitId,
        activities: activities
      };

      lessons.push(lesson);
    });
  });

  // Write to JSON file
  const outputPath = path.join(__dirname, 'lessons_export.json');
  const jsonContent = JSON.stringify(lessons, null, 2);
  
  fs.writeFileSync(outputPath, jsonContent, 'utf8');
  
  console.log(`✅ Successfully processed ${lessons.length} lessons`);
  console.log(`📁 Output written to: ${outputPath}`);
  
  // Log summary statistics
  const totalActivities = lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);
  const lessonsWithQuizzes = lessons.filter(lesson => 
    lesson.activities.some(activity => activity.type === 'quiz')
  ).length;
  
  console.log(`📊 Summary:`);
  console.log(`   - Total lessons: ${lessons.length}`);
  console.log(`   - Total activities: ${totalActivities}`);
  console.log(`   - Lessons with quizzes: ${lessonsWithQuizzes}`);
  console.log(`   - Lessons without quizzes: ${lessons.length - lessonsWithQuizzes}`);
}

// Run the processing function
try {
  processLessons();
} catch (error) {
  console.error('❌ Error processing lessons:', error);
  process.exit(1);
} 