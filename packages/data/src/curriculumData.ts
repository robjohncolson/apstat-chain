import type { CurriculumUnit } from './types.js';

/**
 * Complete AP Statistics curriculum data structure
 * Converted from allUnitsData.js to TypeScript for type safety and modern imports
 */
export const ALL_UNITS_DATA: CurriculumUnit[] = [
  {
    unitId: 'unit1',
    displayName: "Unit 1: Exploring One-Variable Data",
    examWeight: "15-23%",
    topics: [
      {
        id: "1-1",
        name: "Topic 1.1",
        description: "Introducing Statistics: What Can We Learn from Data?",
        videos: [
            {
                url: "https://apclassroom.collegeboard.org/d/708w9bpk60?sui=33,1",
                altUrl: "https://drive.google.com/file/d/1wEbNmDM4KBUWvvoRoQIgIYKYWxG3x6Cv/view?usp=drive_link",
                completed: false,
                completionDate: null
            }
        ],
        blooket: {
            url: "https://dashboard.blooket.com/set/6847bb74fe947147cb3c05de",
            completed: false,
            completionDate: null
        },
        origami: {
            name: "Paper Airplane (Classic Dart)",
            description: "Perfect starter - turn your notes into flight!",
            videoUrl: "https://www.youtube.com/watch?v=veyZNyurlwU",
            reflection: "As your paper airplane soars, think about how data can help us explore and understand our world, just like this lesson introduced you to statistics."
        },
        quizzes: [],
        current: false
      },
      {
        id: "1-2",
        name: "Topic 1.2",
        description: "The Language of Variation: Variables",
        videos: [
            {
                url: "https://apclassroom.collegeboard.org/d/o7atnjt521?sui=33,1",
                altUrl: "https://drive.google.com/file/d/1cJ3a5DSlZ0w3vta901HVyADfQ-qKVQcD/view?usp=drive_link",
                completed: false,
                completionDate: null
            }
        ],
        blooket: {
            url: "https://dashboard.blooket.com/set/6847beef46fe0cb8b31e937f",
            completed: false,
            completionDate: null
        },
        origami: {
            name: "Simple Boat",
            description: "Navigate the waters of variables with your paper boat",
            videoUrl: "https://www.youtube.com/watch?v=vNba3jbBSOw",
            reflection: "Like variables that take different values, your boat can sail different paths. Reflect on how data varies and what that tells us."
        },
        quizzes: [
            {
                questionPdf: "pdfs/unit1/unit1_section1.2_quiz.pdf",
                answersPdf: "pdfs/unit1/unit1_section1.2_answers.pdf",
                quizId: "1-2_q1",
                completed: false,
                completionDate: null
            }
        ],
        current: false
      }
      // NOTE: This is a truncated version for initial implementation
      // The full data will be migrated in subsequent steps
    ]
  }
  // NOTE: Additional units will be added in subsequent migration steps
];

/**
 * Helper function to calculate total item counts across the curriculum
 * Migrated from allUnitsData.js for compatibility
 */
export function getTotalItemCounts(allUnitsDataArray: CurriculumUnit[] = ALL_UNITS_DATA) {
    let totalVideos = 0;
    let totalQuizzes = 0;

    if (!allUnitsDataArray || !Array.isArray(allUnitsDataArray)) {
        console.error("Invalid data provided to getTotalItemCounts");
        return { totalVideos: 0, totalQuizzes: 0 };
    }

    allUnitsDataArray.forEach(unit => {
        if (unit.topics && Array.isArray(unit.topics)) {
            unit.topics.forEach(topic => {
                // Count videos
                if (topic.videos && Array.isArray(topic.videos)) {
                    totalVideos += topic.videos.length;
                }
                // Count quizzes
                if (topic.quizzes && Array.isArray(topic.quizzes)) {
                    totalQuizzes += topic.quizzes.length;
                }
            });
        }
    });

    console.log(`getTotalItemCounts calculated: ${totalVideos} videos, ${totalQuizzes} quizzes`);
    return { totalVideos, totalQuizzes };
} 