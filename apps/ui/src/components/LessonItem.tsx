import type { Lesson, Activity } from '@apstat-chain/data'

interface EnrichedActivity extends Activity {
  completed: boolean;
}

interface LessonItemProps {
  lesson: Lesson & { activities: EnrichedActivity[] };
}

export function LessonItem({ lesson }: LessonItemProps) {
  // Calculate completion stats
  const completedActivities = lesson.activities.filter((activity: EnrichedActivity) => activity.completed).length;
  const totalActivities = lesson.activities.length;
  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const isCompleted = progress === 100;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      {/* Lesson Header */}
      <div className={`px-5 py-4 border-b border-gray-200 dark:border-gray-700 ${
        isCompleted 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900'
          : progress > 0 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900'
          : 'bg-gray-50 dark:bg-gray-900'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              isCompleted 
                ? 'bg-green-500 text-white'
                : progress > 0 
                ? 'bg-blue-500 text-white'
                : 'bg-gray-400 text-white'
            }`}>
              {isCompleted ? '✓' : Math.round(progress)}
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${
                isCompleted 
                  ? 'text-green-800 dark:text-green-200'
                  : progress > 0 
                  ? 'text-blue-800 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {lesson.title}
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedActivities} of {totalActivities} activities
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                    : progress > 0 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {progress.toFixed(0)}% complete
                </span>
              </div>
            </div>
          </div>
          <div className="text-2xl">
            {isCompleted ? '🎉' : progress > 0 ? '📚' : '📖'}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="p-5">
        <div className="space-y-3">
          {lesson.activities.map((activity: EnrichedActivity) => (
            <div 
              key={activity.id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                activity.completed
                  ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activity.completed 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {activity.completed ? '✓' : '○'}
                </div>
                <span className={`text-sm font-medium ${
                  activity.completed 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {activity.title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {activity.completed && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                    Complete
                  </span>
                )}
                <span className="text-lg">
                  {activity.completed ? '🎯' : '⏳'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {totalActivities > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              {isCompleted ? (
                <div className="text-green-600 dark:text-green-400">
                  <span className="text-lg mr-2">🎉</span>
                  <span className="font-semibold">Lesson completed!</span>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="text-sm">
                    {totalActivities - completedActivities} more {totalActivities - completedActivities === 1 ? 'activity' : 'activities'} to complete
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 