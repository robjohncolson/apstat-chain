import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Shield, Lock } from 'lucide-react';

interface MockActivity {
  id: string;
  type: 'video' | 'quiz' | 'blooket' | 'origami';
  title: string;
  description?: string;
  url?: string;
  completed: boolean;
  duration?: string;
  points: number;
}

interface MockLesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  activities: MockActivity[];
}

interface NewLessonItemProps {
  lesson: MockLesson;
}

export function NewLessonItem({ lesson }: NewLessonItemProps) {
  const [completingActivities, setCompletingActivities] = useState<Set<string>>(new Set());

  const completedCount = lesson.activities.filter(a => a.completed).length;
  const totalCount = lesson.activities.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isFullyCompleted = progressPercentage === 100;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video': return '▶️';
      case 'quiz': return '📝';
      case 'blooket': return '🎮';
      case 'origami': return '📺';
      default: return '⭕';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'quiz': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'blooket': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'origami': return 'bg-pink-500 hover:bg-pink-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Watch Video';
      case 'quiz': return 'Take Quiz';
      case 'blooket': return 'Play Game';
      case 'origami': return 'Learn Origami';
      default: return 'Start Activity';
    }
  };

  const handleActivityClick = (activity: MockActivity) => {
    if (activity.url) {
      window.open(activity.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (completingActivities.has(activityId)) return;
    
    const activity = lesson.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    setCompletingActivities(prev => new Set(prev).add(activityId));
    
    // Show initial blockchain submission toast
    const toastId = toast.loading("Submitting to network... ⛓️", {
      description: "Recording your progress on the blockchain",
      duration: Infinity,
    });
    
    // Simulate blockchain transaction delay
    setTimeout(() => {
      // Mark activity as completed
      activity.completed = true;
      
      // Update toast to success
      toast.success("Success! Activity recorded on-chain. ✅", {
        id: toastId,
        description: "Your progress is now permanently secured",
        duration: 4000,
      });
      
      setCompletingActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
    }, 2000);
  };

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${
      isFullyCompleted 
        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
        : 'border-border hover:border-primary/50'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                isFullyCompleted 
                  ? 'bg-green-500 text-white' 
                  : progressPercentage > 0 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isFullyCompleted ? '✓' : `${Math.round(progressPercentage)}%`}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {lesson.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lesson.description}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {completedCount} of {totalCount} activities completed
                  </span>
                  <Badge variant={isFullyCompleted ? "default" : "secondary"} className="text-xs">
                    {isFullyCompleted ? "Complete" : "In Progress"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>🏆 {lesson.activities.reduce((sum, a) => sum + a.points, 0)} pts</span>
                </div>
              </div>
            </div>
          </div>
          
          {isFullyCompleted && (
            <div className="text-2xl animate-bounce">🎉</div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-medium text-foreground">Learning Activities</h4>
            <Badge variant="outline" className="text-xs">
              Click to start
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.activities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                  activity.completed 
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
                onClick={() => handleActivityClick(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {activity.completed ? (
                        <div className="flex items-center gap-1">
                          <span className="text-green-500">✅</span>
                          <div title="Verified on-chain">
                            <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400 opacity-70" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">⭕</span>
                      )}
                      <span className="font-medium text-sm">{activity.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.points} pts
                    </Badge>
                  </div>
                  
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button 
                      size="sm" 
                      className={`${getActivityColor(activity.type)} transition-all duration-200`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity);
                      }}
                    >
                      <span className="mr-2">{getActivityIcon(activity.type)}</span>
                      <span>{getActivityLabel(activity.type)}</span>
                      <span className="ml-2">↗️</span>
                    </Button>
                    
                    {activity.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>⏱️ {activity.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  {!activity.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteActivity(activity.id);
                      }}
                      disabled={completingActivities.has(activity.id)}
                    >
                      {completingActivities.has(activity.id) ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Completing...
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isFullyCompleted ? (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div className="text-green-700 dark:text-green-300 font-medium mb-1">
              🎯 Excellent work! Lesson completed successfully.
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Your progress has been recorded on the blockchain.
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <div className="text-blue-700 dark:text-blue-300 font-medium mb-1">
              Keep going! {totalCount - completedCount} more activities to complete.
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Each activity brings you closer to mastering this topic.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 