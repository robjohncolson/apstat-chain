import type { Lesson, Activity } from '@apstat-chain/data'

interface EnrichedActivity extends Activity {
  completed: boolean;
}

interface LessonItemProps {
  lesson: Lesson & { activities: EnrichedActivity[] };
}

export function LessonItem({ lesson }: LessonItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        {lesson.title}
      </h3>
      
      <div className="space-y-2">
        {lesson.activities.map((activity: EnrichedActivity) => (
          <div key={activity.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activity.title}
            </span>
            <span className="text-lg">
              {activity.completed ? '✅' : '⬜️'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 