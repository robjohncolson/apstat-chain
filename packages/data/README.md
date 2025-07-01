# @apstat-chain/data

Curriculum data package for AP Statistics Chain

## Overview

This package provides the core curriculum data structures and management services for the AP Statistics Chain project. It implements the unified curriculum data architecture specified in ADR 021.

## V2 CurriculumManager Service (ADR 021)

The `CurriculumManager` is the core service for managing AP Statistics curriculum data according to ADR 021: Canonical V2 Curriculum Data Structure.

### Features

- **Type-Safe Data Access**: Full TypeScript interfaces for all curriculum structures
- **Progress Tracking**: Comprehensive completion statistics across videos, quizzes, and blookets
- **State Management**: Current topic navigation and session state
- **Search & Discovery**: Topic search and filtering capabilities
- **Data Mutation**: Methods for marking activities as completed (Phase 2 blockchain integration ready)

### Usage

```typescript
import { CurriculumManager } from '@apstat-chain/data';

// Initialize the manager
const manager = new CurriculumManager();

// Core data access
const allUnits = manager.getAllUnits();
const unit1 = manager.getUnit('unit1');
const topic = manager.getTopic('unit1', '1-1');

// Progress tracking
const totalCounts = manager.getTotalCounts();
const completionStats = manager.getCompletionStats();
const unitStats = manager.getCompletionStats('unit1');

// State management
manager.setCurrentTopic('unit1', '1-1');
const currentTopic = manager.getCurrentTopic();

// Convenience methods
const allTopics = manager.getAllTopics();
const capstones = manager.getCapstoneTopics();
const searchResults = manager.searchTopics('statistics');

// Activity completion (ready for blockchain integration)
manager.markVideoCompleted('unit1', '1-1', 0);
manager.markQuizCompleted('unit1', '1-1', 0);
manager.markBlooketCompleted('unit1', '1-1');
```

### Data Structure

The curriculum follows the unified schema from ADR 021:

- **CurriculumUnit**: Top-level unit with topics array
- **CurriculumTopic**: Individual topics with videos, quizzes, blooket, and origami
- **ActivityBase**: Base interface with completion tracking
- **VideoActivity, QuizActivity, BlooketActivity**: Specific activity types
- **OrigamiActivity**: Creative hands-on learning activities

### Testing

The service includes comprehensive test coverage:

```bash
npm test
```

All 24 tests pass, covering:
- Core data access methods
- Progress tracking functionality  
- State management operations
- Convenience methods
- Data mutation capabilities

## Legacy Data

The package also maintains backward compatibility with the legacy lesson and question data structures:

```typescript
import { ALL_LESSONS, ALL_QUESTIONS } from '@apstat-chain/data';
```

## Development

```bash
# Build the package
npm run build

# Run tests
npm test

# Clean build artifacts
npm run clean
```

## Phase 2 Integration

The CurriculumManager is designed to integrate seamlessly with the blockchain service in Phase 2. All completion tracking methods return success indicators and automatically generate timestamps, ready for blockchain transaction recording.

## Structure

```
packages/data/
├── src/                    # Processed data and TypeScript definitions
│   ├── index.ts           # Main entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── lessons_export.json # Processed lessons data
│   └── questions_export.json # Processed questions data
└── assets/                # Raw source assets
    ├── db/                # Database files
    ├── lessons/           # Raw lesson data files
    └── questions/         # Question image directories by unit
```

## Usage

```typescript
import { ALL_LESSONS, ALL_QUESTIONS, Lesson, QuizQuestion } from '@apstat-chain/data';

// Access all lessons
console.log(ALL_LESSONS.length);

// Access all questions
console.log(ALL_QUESTIONS.length);

// Use types
const lesson: Lesson = ALL_LESSONS[0];
const question: QuizQuestion = ALL_QUESTIONS[0];
```

## Data Types

### Lesson
- `id`: Unique lesson identifier
- `title`: Lesson title
- `unitId`: Associated unit identifier
- `activities`: Array of activities within the lesson

### QuizQuestion
- `id`: Unique question identifier
- `questionImage`: Path to question image
- `year`: Year the question was from
- `source`: Source description
- `linkedLessonIds`: Array of associated lesson IDs

### Activity
- `id`: Unique activity identifier
- `type`: Activity type (video, quiz, blooket, etc.)
- `title`: Activity title
- `contribution`: Weight contribution to lesson (0-1)

## Building

```bash
npm run build
``` 