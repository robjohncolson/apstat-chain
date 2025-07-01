import type { 
  CurriculumUnit, 
  CurriculumTopic, 
  TotalCounts, 
  CompletionStats 
} from './types.js';
import { ALL_UNITS_DATA } from './curriculumData.js';

/**
 * CurriculumManager - Core service for managing AP Statistics curriculum data
 * 
 * Implements Phase 1 of ADR 021: Canonical V2 Curriculum Data Structure
 * Provides unified access to curriculum data with progress tracking and state management
 */
export class CurriculumManager {
  private data: CurriculumUnit[];
  private currentUnitId: string | null = null;
  private currentTopicId: string | null = null;

  constructor(curriculumData?: CurriculumUnit[]) {
    // Allow injection of data for testing, otherwise use default curriculum data
    this.data = curriculumData || ALL_UNITS_DATA;
  }

  // === CORE DATA ACCESS METHODS ===

  /**
   * Get all curriculum units
   */
  getAllUnits(): CurriculumUnit[] {
    return this.data;
  }

  /**
   * Get a specific unit by ID
   */
  getUnit(unitId: string): CurriculumUnit | null {
    return this.data.find(unit => unit.unitId === unitId) || null;
  }

  /**
   * Get a specific topic within a unit
   */
  getTopic(unitId: string, topicId: string): CurriculumTopic | null {
    const unit = this.getUnit(unitId);
    if (!unit) return null;
    
    return unit.topics.find(topic => topic.id === topicId) || null;
  }

  // === PROGRESS TRACKING METHODS ===

  /**
   * Get total counts of all activities across the curriculum
   */
  getTotalCounts(): TotalCounts {
    let videos = 0;
    let quizzes = 0;
    let blookets = 0;

    this.data.forEach(unit => {
      unit.topics.forEach(topic => {
        // Count videos
        videos += topic.videos.length;
        
        // Count quizzes
        quizzes += topic.quizzes.length;
        
        // Count blookets (each topic has exactly one blooket)
        blookets += 1;
      });
    });

    return { videos, quizzes, blookets };
  }

  /**
   * Get completion statistics for the entire curriculum or a specific unit
   */
  getCompletionStats(unitId?: string): CompletionStats {
    const units = unitId ? [this.getUnit(unitId)].filter(Boolean) : this.data;
    
    let totalVideos = 0;
    let completedVideos = 0;
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalBlookets = 0;
    let completedBlookets = 0;

    units.forEach(unit => {
      if (unit) {
        unit.topics.forEach(topic => {
          // Count videos
          totalVideos += topic.videos.length;
          completedVideos += topic.videos.filter(video => video.completed).length;
          
          // Count quizzes
          totalQuizzes += topic.quizzes.length;
          completedQuizzes += topic.quizzes.filter(quiz => quiz.completed).length;
          
          // Count blookets
          totalBlookets += 1;
          if (topic.blooket.completed) completedBlookets += 1;
        });
      }
    });

    const totalActivities = totalVideos + totalQuizzes + totalBlookets;
    const completedActivities = completedVideos + completedQuizzes + completedBlookets;

    return {
      videos: {
        completed: completedVideos,
        total: totalVideos,
        percentage: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
      },
      quizzes: {
        completed: completedQuizzes,
        total: totalQuizzes,
        percentage: totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0
      },
      blookets: {
        completed: completedBlookets,
        total: totalBlookets,
        percentage: totalBlookets > 0 ? Math.round((completedBlookets / totalBlookets) * 100) : 0
      },
      overall: {
        completed: completedActivities,
        total: totalActivities,
        percentage: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
      }
    };
  }

  // === STATE MANAGEMENT METHODS ===

  /**
   * Set the current topic for navigation purposes
   */
  setCurrentTopic(unitId: string, topicId: string): void {
    const unit = this.getUnit(unitId);
    const topic = this.getTopic(unitId, topicId);
    
    if (!unit || !topic) {
      console.warn(`Invalid unit/topic combination: ${unitId}/${topicId}`);
      return;
    }

    // Clear all current flags
    this.data.forEach(u => {
      u.topics.forEach(t => {
        t.current = false;
      });
    });

    // Set the new current topic
    topic.current = true;
    this.currentUnitId = unitId;
    this.currentTopicId = topicId;
  }

  /**
   * Get the currently active topic
   */
  getCurrentTopic(): { unit: CurriculumUnit, topic: CurriculumTopic } | null {
    if (!this.currentUnitId || !this.currentTopicId) return null;
    
    const unit = this.getUnit(this.currentUnitId);
    const topic = this.getTopic(this.currentUnitId, this.currentTopicId);
    
    if (!unit || !topic) return null;
    
    return { unit, topic };
  }

  // === CONVENIENCE METHODS ===

  /**
   * Get all topics across all units (flattened view)
   */
  getAllTopics(): Array<{ unit: CurriculumUnit, topic: CurriculumTopic }> {
    const allTopics: Array<{ unit: CurriculumUnit, topic: CurriculumTopic }> = [];
    
    this.data.forEach(unit => {
      unit.topics.forEach(topic => {
        allTopics.push({ unit, topic });
      });
    });
    
    return allTopics;
  }

  /**
   * Get all capstone topics (unit assessments)
   */
  getCapstoneTopics(): Array<{ unit: CurriculumUnit, topic: CurriculumTopic }> {
    return this.getAllTopics().filter(({ topic }) => topic.isCapstone);
  }

  /**
   * Get topics by completion status
   */
  getTopicsByCompletion(completed: boolean): Array<{ unit: CurriculumUnit, topic: CurriculumTopic }> {
    return this.getAllTopics().filter(({ topic }) => {
      const allVideosCompleted = topic.videos.every(video => video.completed);
      const allQuizzesCompleted = topic.quizzes.every(quiz => quiz.completed);
      const blooketCompleted = topic.blooket.completed;
      
      const topicCompleted = allVideosCompleted && allQuizzesCompleted && blooketCompleted;
      return topicCompleted === completed;
    });
  }

  /**
   * Search topics by description or name
   */
  searchTopics(query: string): Array<{ unit: CurriculumUnit, topic: CurriculumTopic }> {
    const searchTerm = query.toLowerCase();
    
    return this.getAllTopics().filter(({ topic }) => 
      topic.name.toLowerCase().includes(searchTerm) ||
      topic.description.toLowerCase().includes(searchTerm)
    );
  }

  // === DATA MUTATION METHODS (for future blockchain integration) ===

  /**
   * Mark a video as completed
   */
  markVideoCompleted(unitId: string, topicId: string, videoIndex: number, completionDate?: string): boolean {
    const topic = this.getTopic(unitId, topicId);
    if (!topic || !topic.videos[videoIndex]) return false;
    
    topic.videos[videoIndex].completed = true;
    topic.videos[videoIndex].completionDate = completionDate || new Date().toISOString();
    return true;
  }

  /**
   * Mark a quiz as completed
   */
  markQuizCompleted(unitId: string, topicId: string, quizIndex: number, completionDate?: string): boolean {
    const topic = this.getTopic(unitId, topicId);
    if (!topic || !topic.quizzes[quizIndex]) return false;
    
    topic.quizzes[quizIndex].completed = true;
    topic.quizzes[quizIndex].completionDate = completionDate || new Date().toISOString();
    return true;
  }

  /**
   * Mark a blooket as completed
   */
  markBlooketCompleted(unitId: string, topicId: string, completionDate?: string): boolean {
    const topic = this.getTopic(unitId, topicId);
    if (!topic) return false;
    
    topic.blooket.completed = true;
    topic.blooket.completionDate = completionDate || new Date().toISOString();
    return true;
  }
} 