import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LessonItem } from './LessonItem'
import type { Lesson } from '@apstat-chain/data'

describe('LessonItem', () => {
  it('should render lesson title and activity completion status', () => {
    // Arrange
    const mockLesson: Lesson & { activities: Array<{ id: string; type: string; title: string; contribution: number; completed: boolean }> } = {
      id: 'lesson-1',
      title: 'Introduction to Statistics',
      unitId: 'unit-1',
      activities: [
        {
          id: 'activity-1',
          type: 'video',
          title: 'Video: Statistics Basics',
          contribution: 0.5,
          completed: true
        },
        {
          id: 'activity-2',
          type: 'quiz',
          title: 'Quiz: Basic Concepts',
          contribution: 0.5,
          completed: false
        }
      ]
    }

    // Act
    render(<LessonItem lesson={mockLesson} />)

    // Assert
    expect(screen.getByText('Introduction to Statistics')).toBeInTheDocument()
    expect(screen.getByText('Video: Statistics Basics')).toBeInTheDocument()
    expect(screen.getByText('Quiz: Basic Concepts')).toBeInTheDocument()
    
    // Verify completion indicators
    expect(screen.getByText('✅')).toBeInTheDocument() // completed activity
    expect(screen.getByText('⬜️')).toBeInTheDocument() // incomplete activity
  })
}) 