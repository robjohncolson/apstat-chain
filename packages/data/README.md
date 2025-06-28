# @apstat-chain/data

This package contains all curriculum data for the AP Statistics Chain project, including lessons, activities, and quiz questions.

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