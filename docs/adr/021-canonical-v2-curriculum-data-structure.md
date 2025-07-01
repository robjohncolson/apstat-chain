# ADR 021: Canonical V2 Curriculum Data Structure

**Date:** 2025-6-30  
**Status:** Accepted  
**Context:** V2 Development Phase - Blockchain-Powered Student Experience  

## Context

Our V2 development requires a definitive curriculum data structure that preserves the proven student experience of the "battle-tested" APStat-SY2526 version while providing the foundation for blockchain-based progress tracking. Analysis of both `allUnitsData.js.old` (historical success) and `allUnitsData.js` (current evolution) reveals a clear path forward.

## Historical Success Analysis

The `allUnitsData.js.old` file represents a battle-tested curriculum structure with proven success factors:

- **Consistent Core Architecture**: Reliable video + quiz patterns with completion tracking
- **Robust PDF Management**: Consistent resource paths ensuring reliable access
- **Flexible Content Structure**: Support for variable videos/quizzes per topic
- **Proven Utility Functions**: Helper functions for progress analytics
- **Capstone Pattern**: Unit-level assessment structure with `isCapstone: true`

## Current Enhancement Analysis

The current `allUnitsData.js` preserves the entire core structure while adding valuable engagement features:

- **Blooket Integration**: Game-based learning with completion tracking
- **Origami Activities**: Hands-on learning with reflection components
- **Enhanced Module Support**: ES6 exports for modern build systems

## Decision

We adopt a **unified schema** that preserves the battle-tested core while incorporating proven enhancements:

### Core Data Structure

```typescript
interface CurriculumUnit {
  unitId: string;              // "unit1", "unit2", etc.
  displayName: string;         // "Unit 1: Exploring One-Variable Data"
  examWeight: string;          // "15-23%" (AP exam weighting)
  topics: CurriculumTopic[];
}

interface CurriculumTopic {
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
```

### Activity Structures

```typescript
interface ActivityBase {
  completed: boolean;
  completionDate: string | null;
}

interface VideoActivity extends ActivityBase {
  url: string;                 // Primary AP Classroom URL
  altUrl: string | null;       // Backup Google Drive URL
}

interface QuizActivity extends ActivityBase {
  questionPdf?: string;        // Path to quiz questions (optional)
  answersPdf: string;          // Path to answer key (required)
  quizId: string;              // Unique identifier
}

interface BlooketActivity extends ActivityBase {
  url: string;                 // Blooket game set URL
}

interface OrigamiActivity {
  name: string;                // Activity name
  description: string;         // Brief description
  videoUrl: string;            // Instruction video URL
  reflection: string;          // Reflection prompt
}
```

## Implementation Plan

### Phase 1: CurriculumManager Service

Create a dedicated `CurriculumManager` class responsible for:

```typescript
class CurriculumManager {
  private data: CurriculumUnit[];
  
  // Core data access
  getAllUnits(): CurriculumUnit[]
  getUnit(unitId: string): CurriculumUnit | null
  getTopic(unitId: string, topicId: string): CurriculumTopic | null
  
  // Progress tracking
  getTotalCounts(): { videos: number, quizzes: number, blookets: number }
  getCompletionStats(unitId?: string): CompletionStats
  
  // State management
  setCurrentTopic(unitId: string, topicId: string): void
  getCurrentTopic(): { unit: CurriculumUnit, topic: CurriculumTopic } | null
}
```

### Phase 2: Blockchain Integration

The `CurriculumManager` will coordinate with `BlockchainService` to record completion events:

```typescript
interface ActivityCompletionTransaction {
  type: 'ACTIVITY_COMPLETE';
  payload: {
    unitId: string;
    topicId: string;
    activityType: 'video' | 'quiz' | 'blooket';
    activityId: string;
    timestamp: number;
    studentId: string;
  };
}
```

### Phase 3: UI Integration

The unified data structure enables consistent UI patterns:

- **Topic Navigation**: Uses `current` flags and navigation state
- **Progress Visualization**: Leverages completion tracking across all activity types
- **Resource Management**: Consistent PDF and URL handling
- **Engagement Features**: Unified presentation of videos, quizzes, blookets, and origami

## Consequences

### Positive
- Preserves proven student experience patterns
- Enables comprehensive blockchain-based progress tracking
- Maintains backward compatibility with existing UI components
- Provides foundation for enhanced engagement features
- Clear separation of concerns between data structure and blockchain logic

### Considerations
- Requires migration of current data to unified schema
- Blockchain service must handle multiple activity types
- UI components need updates to support new activity types

## Migration Strategy

1. **Data Validation**: Ensure current data conforms to unified schema
2. **Service Implementation**: Create `CurriculumManager` with full API
3. **UI Updates**: Modify components to use new service
4. **Blockchain Integration**: Connect completion events to transaction recording
5. **Testing**: Comprehensive validation of student experience flows

## Success Metrics

- Zero disruption to core student learning flows
- Complete activity completion tracking via blockchain
- Successful integration of engagement features (blooket, origami)
- Maintainable, type-safe curriculum data management

---

This ADR establishes the canonical curriculum data structure for V2, ensuring we build upon proven success while enabling blockchain-powered student progress tracking. 