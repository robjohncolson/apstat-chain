import type { Lesson, Activity } from '@apstat-chain/data'
import { useCurriculum } from '../providers/CurriculumProvider'
import { parseActivityId } from '../utils/curriculumAdapter'
import { LoadingSpinner } from './LoadingSpinner'
import { useState } from 'react'

interface EnrichedActivity extends Activity {
  completed: boolean;
}

interface LessonItemProps {
  lesson: Lesson & { activities: EnrichedActivity[] };
}

export function LessonItem({ lesson }: LessonItemProps) {
  const { markVideoCompleted, markQuizCompleted, markBlooketCompleted } = useCurriculum();
  const [completingActivities, setCompletingActivities] = useState<Set<string>>(new Set());

  // Calculate completion stats
  const completedActivities = lesson.activities.filter((activity: EnrichedActivity) => activity.completed).length;
  const totalActivities = lesson.activities.length;
  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const isCompleted = progress === 100;

  const handleCompleteActivity = async (activity: EnrichedActivity) => {
    if (activity.completed || completingActivities.has(activity.id)) {
      return;
    }

    setCompletingActivities(prev => new Set(prev).add(activity.id));

    try {
      const { unitId, topicId, activityType, activityIndex } = parseActivityId(activity.id);

      switch (activityType) {
        case 'video':
          if (activityIndex !== undefined) {
            await markVideoCompleted(unitId, topicId, activityIndex);
          }
          break;
        case 'quiz':
          if (activityIndex !== undefined) {
            await markQuizCompleted(unitId, topicId, activityIndex);
          }
          break;
        case 'blooket':
          await markBlooketCompleted(unitId, topicId);
          break;
        case 'origami':
          // Origami completion can be added later
          console.log('Origami completion not yet implemented');
          break;
      }
    } catch (error) {
      console.error('Failed to complete activity:', error);
    } finally {
      setCompletingActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activity.id);
        return newSet;
      });
    }
  };

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
          {lesson.activities.map((activity: EnrichedActivity) => {
            const isCompleting = completingActivities.has(activity.id);
            
            return (
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
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      activity.completed 
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {activity.title}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.contribution.toFixed(2)} points
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.completed ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                        Complete
                      </span>
                      <span className="text-lg">🎯</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteActivity(activity)}
                      disabled={isCompleting || activity.type === 'origami'}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activity.type === 'origami'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                          : isCompleting
                          ? 'bg-blue-100 text-blue-600 cursor-not-allowed dark:bg-blue-900 dark:text-blue-400'
                          : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                      }`}
                    >
                      {isCompleting && <LoadingSpinner size="sm" />}
                      {isCompleting ? 'Completing...' : activity.type === 'origami' ? 'Manual' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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