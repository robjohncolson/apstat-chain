import { describe, it, expect } from 'vitest';
import {
  convertUnitsToLessons,
  parseActivityId,
  getUnitDisplayName,
  calculateProgressStats
} from './curriculumAdapter';
import type { CurriculumUnit } from '@apstat-chain/data';

// Test data matching the existing curriculum structure
const mockCurriculumData: CurriculumUnit[] = [
  {
    unitId: 'unit1',
    displayName: 'Unit 1: Exploring One-Variable Data',
    examWeight: '15-23%',
    topics: [
      {
        id: '1-1',
        name: 'Topic 1.1',
        description: 'Introducing Statistics: What Can We Learn from Data?',
        videos: [
          {
            url: 'https://example.com/video1',
            altUrl: 'https://alt.com/video1',
            completed: false,
            completionDate: null
          },
          {
            url: 'https://example.com/video2',
            altUrl: null,
            completed: true,
            completionDate: '2024-01-01T00:00:00.000Z'
          }
        ],
        quizzes: [],
        blooket: {
          url: 'https://blooket.com/set/123',
          completed: true,
          completionDate: '2024-01-01T00:00:00.000Z'
        },
        origami: {
          name: 'Paper Airplane',
          description: 'Perfect starter',
          videoUrl: 'https://youtube.com/origami1',
          reflection: 'Think about data exploration'
        },
        current: false
      },
      {
        id: '1-2',
        name: 'Topic 1.2',
        description: 'The Language of Variation: Variables',
        videos: [
          {
            url: 'https://example.com/video3',
            altUrl: null,
            completed: false,
            completionDate: null
          }
        ],
        quizzes: [
          {
            questionPdf: 'path/to/quiz.pdf',
            answersPdf: 'path/to/answers.pdf',
            quizId: '1-2_q1',
            completed: false,
            completionDate: null
          },
          {
            answersPdf: 'path/to/answers2.pdf',
            quizId: '1-2_q2',
            completed: true,
            completionDate: '2024-01-02T00:00:00.000Z'
          }
        ],
        blooket: {
          url: 'https://blooket.com/set/456',
          completed: false,
          completionDate: null
        },
        origami: {
          name: 'Simple Boat',
          description: 'Navigate variables',
          videoUrl: 'https://youtube.com/boat',
          reflection: 'Reflect on variation'
        },
        current: false
      }
    ]
  },
  {
    unitId: 'unit2',
    displayName: 'Unit 2: Exploring Two-Variable Data',
    examWeight: '10-15%',
    topics: [
      {
        id: '2-1',
        name: 'Topic 2.1',
        description: 'Introduction to Scatterplots and Correlation',
        videos: [],
        quizzes: [
          {
            questionPdf: 'path/to/unit2quiz.pdf',
            answersPdf: 'path/to/unit2answers.pdf',
            quizId: '2-1_q1',
            completed: false,
            completionDate: null
          }
        ],
        blooket: {
          url: '', // Empty URL should not create activity
          completed: false,
          completionDate: null
        },
        origami: {
          name: 'Paper Crane',
          description: 'Symbol of connection',
          videoUrl: 'https://youtube.com/crane',
          reflection: 'Think about relationships'
        },
        current: false
      }
    ]
  }
];

describe('curriculumAdapter', () => {
  describe('convertUnitsToLessons', () => {
    it('should convert curriculum units to enriched lessons correctly', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);

      expect(lessons).toHaveLength(3); // 2 topics from unit1, 1 from unit2
      
      // Check first lesson (1-1)
      const firstLesson = lessons[0];
      expect(firstLesson.id).toBe('1-1');
      expect(firstLesson.title).toBe('Introducing Statistics: What Can We Learn from Data?');
      expect(firstLesson.unitId).toBe('unit1');
      expect(firstLesson.activities).toHaveLength(4); // 2 videos + 1 blooket + 1 origami
    });

    it('should create video activities with correct contribution values', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      
      // Topic 1-1 has 2 videos, each should get 0.15 contribution
      const firstLesson = lessons[0];
      const videoActivities = firstLesson.activities.filter(a => a.type === 'video');
      
      expect(videoActivities).toHaveLength(2);
      expect(videoActivities[0].contribution).toBe(0.15);
      expect(videoActivities[1].contribution).toBe(0.15);
      expect(videoActivities[0].completed).toBe(false);
      expect(videoActivities[1].completed).toBe(true);
    });

    it('should create quiz activities with correct data', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      
      // Topic 1-2 has 2 quizzes
      const secondLesson = lessons[1];
      const quizActivities = secondLesson.activities.filter(a => a.type === 'quiz');
      
      expect(quizActivities).toHaveLength(2);
      expect(quizActivities[0].id).toBe('1-2_q1');
      expect(quizActivities[0].title).toBe('Quiz: Topic 1.2');
      expect(quizActivities[0].contribution).toBe(0.5);
      expect(quizActivities[0].completed).toBe(false);
      expect(quizActivities[1].completed).toBe(true);
    });

    it('should create blooket activities only when URL exists', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      
      // Topic 1-1 has blooket URL
      const firstLesson = lessons[0];
      const blooketActivities = firstLesson.activities.filter(a => a.type === 'blooket');
      expect(blooketActivities).toHaveLength(1);
      expect(blooketActivities[0].completed).toBe(true);

      // Topic 2-1 has empty blooket URL
      const thirdLesson = lessons[2];
      const thirdBlooketActivities = thirdLesson.activities.filter(a => a.type === 'blooket');
      expect(thirdBlooketActivities).toHaveLength(0);
    });

    it('should always create origami activities', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      
      lessons.forEach(lesson => {
        const origamiActivities = lesson.activities.filter(a => a.type === 'origami');
        expect(origamiActivities).toHaveLength(1);
        expect(origamiActivities[0].contribution).toBe(0.05);
        expect(origamiActivities[0].completed).toBe(false); // Origami doesn't track completion
      });
    });

    it('should handle empty units array', () => {
      const lessons = convertUnitsToLessons([]);
      expect(lessons).toHaveLength(0);
    });

    it('should handle unit with no topics', () => {
      const emptyUnit: CurriculumUnit[] = [{
        unitId: 'empty',
        displayName: 'Empty Unit',
        examWeight: '0%',
        topics: []
      }];
      
      const lessons = convertUnitsToLessons(emptyUnit);
      expect(lessons).toHaveLength(0);
    });

    it('should calculate different video contributions based on count', () => {
      const singleVideoUnit: CurriculumUnit[] = [{
        unitId: 'test',
        displayName: 'Test Unit',
        examWeight: '10%',
        topics: [{
          id: 'test-1',
          name: 'Test Topic',
          description: 'Test Description',
          videos: [
            { url: 'video1', altUrl: null, completed: false, completionDate: null }
          ],
          quizzes: [],
          blooket: { url: '', completed: false, completionDate: null },
          origami: { name: 'Test', description: 'Test', videoUrl: 'test', reflection: 'test' },
          current: false
        }]
      }];

      const lessons = convertUnitsToLessons(singleVideoUnit);
      const videoActivity = lessons[0].activities.find(a => a.type === 'video');
      expect(videoActivity?.contribution).toBe(0.8); // Single video gets 0.8

      // Test with 3 videos
      const threeVideoUnit: CurriculumUnit[] = [{
        unitId: 'test',
        displayName: 'Test Unit',
        examWeight: '10%',
        topics: [{
          id: 'test-1',
          name: 'Test Topic',
          description: 'Test Description',
          videos: [
            { url: 'video1', altUrl: null, completed: false, completionDate: null },
            { url: 'video2', altUrl: null, completed: false, completionDate: null },
            { url: 'video3', altUrl: null, completed: false, completionDate: null }
          ],
          quizzes: [],
          blooket: { url: '', completed: false, completionDate: null },
          origami: { name: 'Test', description: 'Test', videoUrl: 'test', reflection: 'test' },
          current: false
        }]
      }];

      const threeVideoLessons = convertUnitsToLessons(threeVideoUnit);
      const threeVideoActivities = threeVideoLessons[0].activities.filter(a => a.type === 'video');
      threeVideoActivities.forEach(activity => {
        expect(activity.contribution).toBe(0.1); // Three videos get 0.1 each
      });
    });
  });

  describe('parseActivityId', () => {
    it('should parse video activity IDs correctly', () => {
      const result = parseActivityId('1-1_video_1');
      
      expect(result).toEqual({
        unitId: 'unit1',
        topicId: '1-1',
        activityType: 'video',
        activityIndex: 0 // Converted to 0-based
      });
    });

    it('should parse video activity IDs with different indices', () => {
      const result = parseActivityId('2-3_video_2');
      
      expect(result).toEqual({
        unitId: 'unit2',
        topicId: '2-3',
        activityType: 'video',
        activityIndex: 1 // Converted to 0-based
      });
    });

    it('should parse quiz activity IDs correctly', () => {
      const result = parseActivityId('1-2_q1');
      
      expect(result).toEqual({
        unitId: 'unit1',
        topicId: '1-2',
        activityType: 'quiz',
        activityIndex: 0 // Converted to 0-based
      });
    });

    it('should parse quiz activity IDs with different indices', () => {
      const result = parseActivityId('3-1_q3');
      
      expect(result).toEqual({
        unitId: 'unit3',
        topicId: '3-1',
        activityType: 'quiz',
        activityIndex: 2 // Converted to 0-based
      });
    });

    it('should parse blooket activity IDs correctly', () => {
      const result = parseActivityId('1-1_blooket');
      
      expect(result).toEqual({
        unitId: 'unit1',
        topicId: '1-1',
        activityType: 'blooket'
      });
    });

    it('should parse origami activity IDs correctly', () => {
      const result = parseActivityId('2-1_origami');
      
      expect(result).toEqual({
        unitId: 'unit2',
        topicId: '2-1',
        activityType: 'origami'
      });
    });

    it('should handle capstone topic IDs', () => {
      const result = parseActivityId('1-capstone_q1');
      
      expect(result).toEqual({
        unitId: 'unit1',
        topicId: '1-capstone',
        activityType: 'quiz',
        activityIndex: 0
      });
    });

    it('should throw error for invalid activity ID format', () => {
      expect(() => parseActivityId('invalid-format')).toThrow(
        'Unable to parse activity ID: invalid-format'
      );
    });

    it('should throw error for empty activity ID', () => {
      expect(() => parseActivityId('')).toThrow(
        'Unable to parse activity ID: '
      );
    });

    it('should handle malformed video ID gracefully', () => {
      const result = parseActivityId('1-1_video_');
      expect(result.activityType).toBe('video');
      expect(result.activityIndex).toBeNaN(); // Empty string parses to NaN
    });

    it('should handle malformed quiz ID gracefully', () => {
      const result = parseActivityId('1-1_q');
      expect(result.activityType).toBe('quiz');
      expect(result.activityIndex).toBeNaN(); // Empty string parses to NaN
    });
  });

  describe('getUnitDisplayName', () => {
    it('should return correct display name for existing unit', () => {
      const displayName = getUnitDisplayName('unit1', mockCurriculumData);
      expect(displayName).toBe('Unit 1: Exploring One-Variable Data');
    });

    it('should return correct display name for second unit', () => {
      const displayName = getUnitDisplayName('unit2', mockCurriculumData);
      expect(displayName).toBe('Unit 2: Exploring Two-Variable Data');
    });

    it('should return fallback display name for non-existent unit', () => {
      const displayName = getUnitDisplayName('unit3', mockCurriculumData);
      expect(displayName).toBe('Unit 3');
    });

    it('should handle edge case unit IDs', () => {
      const displayName = getUnitDisplayName('unit10', mockCurriculumData);
      expect(displayName).toBe('Unit 10');
    });

    it('should handle empty units array', () => {
      const displayName = getUnitDisplayName('unit1', []);
      expect(displayName).toBe('Unit 1');
    });

    it('should handle malformed unit ID', () => {
      const displayName = getUnitDisplayName('invalid', mockCurriculumData);
      expect(displayName).toBe('Unit invalid');
    });
  });

  describe('calculateProgressStats', () => {
    it('should calculate progress stats correctly', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      const stats = calculateProgressStats(lessons);

      // Count total activities: 
      // Lesson 1-1: 2 videos + 1 blooket + 1 origami = 4
      // Lesson 1-2: 1 video + 2 quizzes + 1 blooket + 1 origami = 5  
      // Lesson 2-1: 1 quiz + 1 origami = 2 (no blooket due to empty URL)
      // Total: 11 activities

      // Count completed:
      // Lesson 1-1: 1 video + 1 blooket = 2
      // Lesson 1-2: 1 quiz = 1
      // Lesson 2-1: 0
      // Total: 3 completed

      expect(stats.total).toBe(11);
      expect(stats.completed).toBe(3);
      expect(stats.percentage).toBe(27); // Math.round(3/11 * 100) = 27
    });

    it('should handle empty lessons array', () => {
      const stats = calculateProgressStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('should handle lessons with no activities', () => {
      const emptyLessons = [{
        id: 'test',
        title: 'Test Lesson',
        unitId: 'unit1',
        activities: []
      }];
      
      const stats = calculateProgressStats(emptyLessons);
      
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('should handle all completed activities', () => {
      const completedLessons = [{
        id: 'test',
        title: 'Test Lesson',
        unitId: 'unit1',
        activities: [
          { id: '1', type: 'video', title: 'Video 1', contribution: 0.5, completed: true },
          { id: '2', type: 'quiz', title: 'Quiz 1', contribution: 0.5, completed: true }
        ]
      }];
      
      const stats = calculateProgressStats(completedLessons);
      
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.percentage).toBe(100);
    });

    it('should handle partial completion correctly', () => {
      const partialLessons = [{
        id: 'test',
        title: 'Test Lesson',
        unitId: 'unit1',
        activities: [
          { id: '1', type: 'video', title: 'Video 1', contribution: 0.3, completed: true },
          { id: '2', type: 'quiz', title: 'Quiz 1', contribution: 0.3, completed: false },
          { id: '3', type: 'blooket', title: 'Blooket 1', contribution: 0.3, completed: true }
        ]
      }];
      
      const stats = calculateProgressStats(partialLessons);
      
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.percentage).toBe(67); // Math.round(2/3 * 100) = 67
    });

    it('should round percentage correctly', () => {
      const testLessons = [{
        id: 'test',
        title: 'Test Lesson',
        unitId: 'unit1',
        activities: [
          { id: '1', type: 'video', title: 'Video 1', contribution: 0.33, completed: true },
          { id: '2', type: 'quiz', title: 'Quiz 1', contribution: 0.33, completed: false },
          { id: '3', type: 'blooket', title: 'Blooket 1', contribution: 0.33, completed: false }
        ]
      }];
      
      const stats = calculateProgressStats(testLessons);
      
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.percentage).toBe(33); // Math.round(1/3 * 100) = 33
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with convertUnitsToLessons and calculateProgressStats together', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      const stats = calculateProgressStats(lessons);
      
      // This tests the full flow from curriculum data to progress stats
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.completed).toBeGreaterThanOrEqual(0);
      expect(stats.completed).toBeLessThanOrEqual(stats.total);
      expect(stats.percentage).toBeGreaterThanOrEqual(0);
      expect(stats.percentage).toBeLessThanOrEqual(100);
    });

    it('should create parseable activity IDs', () => {
      const lessons = convertUnitsToLessons(mockCurriculumData);
      
      // Test that all generated activity IDs can be parsed back
      lessons.forEach(lesson => {
        lesson.activities.forEach(activity => {
          if (activity.type !== 'origami') { // Origami parsing not yet implemented
            expect(() => parseActivityId(activity.id)).not.toThrow();
            
            const parsed = parseActivityId(activity.id);
            expect(parsed.unitId).toBe(lesson.unitId);
            expect(parsed.activityType).toBe(activity.type);
          }
        });
      });
    });

    it('should handle the exact curriculum data structure used in the app', () => {
      // This test ensures our adapter works with the real data structure
      const realDataSample: CurriculumUnit[] = [
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
            }
          ]
        }
      ];

      expect(() => convertUnitsToLessons(realDataSample)).not.toThrow();
      
      const lessons = convertUnitsToLessons(realDataSample);
      expect(lessons).toHaveLength(1);
      expect(lessons[0].activities).toHaveLength(3); // 1 video + 1 blooket + 1 origami
      
      const stats = calculateProgressStats(lessons);
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });
  });
});
