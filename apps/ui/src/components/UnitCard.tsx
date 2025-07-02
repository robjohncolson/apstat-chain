import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UnitCardProps {
  unitId: string;
  displayName: string;
  examWeight: string;
  topicsCount: number;
  completedTopics: number;
  totalActivities: number;
  completedActivities: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function UnitCard({
  unitId,
  displayName,
  examWeight,
  topicsCount,
  completedTopics,
  totalActivities,
  completedActivities,
  onClick,
  isSelected = false
}: UnitCardProps) {
  const progressPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const isFullyCompleted = progressPercentage === 100;
  const topicProgressPercentage = topicsCount > 0 ? (completedTopics / topicsCount) * 100 : 0;

  const getUnitIcon = (unitId: string) => {
    switch (unitId) {
      case 'unit1': return '📊';
      case 'unit2': return '🔗';
      case 'unit3': return '🔍';
      case 'unit4': return '🎲';
      case 'unit5': return '📈';
      case 'unit6': return '📋';
      case 'unit7': return '📐';
      case 'unit8': return '📊';
      case 'unit9': return '📈';
      default: return '📚';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected 
          ? 'border-primary shadow-md ring-2 ring-primary/20' 
          : isFullyCompleted 
          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : isFullyCompleted 
                ? 'bg-green-500 text-white' 
                : progressPercentage > 0 
                ? 'bg-primary/10 border-2 border-primary text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {isFullyCompleted ? '✓' : getUnitIcon(unitId)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight mb-1">
                {displayName}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                AP Exam Weight: {examWeight}
              </Badge>
            </div>
          </div>
          
          {isFullyCompleted && (
            <div className="text-2xl animate-bounce">🎉</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Topic Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Topics Completed</span>
            <span className="text-muted-foreground">{completedTopics} of {topicsCount}</span>
          </div>
          <Progress value={topicProgressPercentage} className="h-1.5" />
        </div>

        {/* Activity Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Activities:</span>
              <span className="font-medium">{completedActivities}/{totalActivities}</span>
            </div>
            <Badge 
              variant={isFullyCompleted ? "default" : progressPercentage > 0 ? "secondary" : "outline"} 
              className="text-xs"
            >
              {isFullyCompleted ? "Complete" : progressPercentage > 0 ? "In Progress" : "Not Started"}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            variant={isSelected ? "default" : "outline"} 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {isSelected ? "✨ Currently Viewing" : progressPercentage > 0 ? "Continue Learning" : "Start Unit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 