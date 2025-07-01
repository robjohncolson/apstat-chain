import type { Lesson } from '@apstat-chain/data'
import { useCurriculum } from '../providers/CurriculumProvider'
import { parseActivityId } from '../utils/curriculumAdapter'
import { LoadingSpinner } from './LoadingSpinner'
import { useState } from 'react'

interface EnrichedActivity {
  id: string;
  type: string;
  title: string;
  contribution: number;
  completed: boolean;
  url?: string;
  altUrl?: string;
  blooketUrl?: string;
  origamiVideoUrl?: string;
  questionPdf?: string;
  answersPdf?: string;
}

interface LessonItemProps {
  lesson: Lesson & { activities: EnrichedActivity[] };
}

export function LessonItem({ lesson }: LessonItemProps) {
  const { markVideoCompleted, markQuizCompleted, markBlooketCompleted, units } = useCurriculum();
  const [completingActivities, setCompletingActivities] = useState<Set<string>>(new Set());

  // Calculate completion stats
  const completedActivities = lesson.activities.filter((activity: EnrichedActivity) => activity.completed).length;
  const totalActivities = lesson.activities.length;
  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const isCompleted = progress === 100;

  // Get the actual curriculum data to access URLs
  const getActivityUrls = (activity: EnrichedActivity) => {
    const { unitId, topicId, activityType, activityIndex } = parseActivityId(activity.id);
    const unit = units.find(u => u.unitId === unitId);
    const topic = unit?.topics.find(t => t.id === topicId);
    
    if (!topic) return {};

    switch (activityType) {
      case 'video':
        if (activityIndex !== undefined && topic.videos[activityIndex]) {
          const video = topic.videos[activityIndex];
          return {
            url: video.url,
            altUrl: video.altUrl || undefined
          };
        }
        break;
      case 'blooket':
        return { blooketUrl: topic.blooket.url };
      case 'origami':
        return { origamiVideoUrl: topic.origami.videoUrl };
      case 'quiz':
        if (activityIndex !== undefined && topic.quizzes[activityIndex]) {
          const quiz = topic.quizzes[activityIndex];
          return {
            questionPdf: quiz.questionPdf || undefined,
            answersPdf: quiz.answersPdf || undefined
          };
        }
        break;
    }
    return {};
  };

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

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
            const urls = getActivityUrls(activity);
            
            return (
              <div 
                key={activity.id} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  activity.completed
                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
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
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Access Links */}
                  {activity.type === 'video' && urls.url && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openInNewTab(urls.url!)}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                      >
                        📺 AP Class
                      </button>
                      {urls.altUrl && (
                        <button
                          onClick={() => openInNewTab(urls.altUrl!)}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                          📁 Drive
                        </button>
                      )}
                    </div>
                  )}
                  
                  {activity.type === 'blooket' && urls.blooketUrl && (
                    <button
                      onClick={() => openInNewTab(urls.blooketUrl!)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
                    >
                      🎮 Play
                    </button>
                  )}
                  
                  {activity.type === 'origami' && urls.origamiVideoUrl && (
                    <button
                      onClick={() => openInNewTab(urls.origamiVideoUrl!)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800"
                    >
                      📝 Tutorial
                    </button>
                  )}
                  
                  {activity.type === 'quiz' && (urls.questionPdf || urls.answersPdf) && (
                    <div className="flex space-x-1">
                      {urls.questionPdf && (
                        <button
                          onClick={() => openInNewTab(urls.questionPdf!)}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                        >
                          📋 Quiz
                        </button>
                      )}
                      {urls.answersPdf && (
                        <button
                          onClick={() => openInNewTab(urls.answersPdf!)}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                          ✅ Answers
                        </button>
                      )}
                    </div>
                  )}

                  {/* Completion Button */}
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
                <div className="text-green-600 dark:text-green-400 font-medium">
                  🎉 Lesson completed! Great work!
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {totalActivities - completedActivities} more activities to complete
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 