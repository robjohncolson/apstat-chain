import { gateway } from '@apstat-chain/core';
import type { CurriculumTopic, VideoActivity, QuizActivity } from '@apstat-chain/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface TopicCardProps {
  unitId: string;
  topic: CurriculumTopic;
  onUpdate: () => void; // A function to trigger a re-render in the parent
}

export const TopicCard = ({ unitId, topic, onUpdate }: TopicCardProps) => {
  const isCompleted = topic.videos.every((v: VideoActivity) => v.completed) && topic.quizzes.every((q: QuizActivity) => q.completed);

  const handleItemCompletion = async (itemType: 'video' | 'quiz', itemId: string, completed: boolean) => {
    // This is an optimistic update. We immediately update the local state.
    const activity = itemType === 'video' 
      ? topic.videos.find((v: VideoActivity) => v.url === itemId || v.altUrl === itemId)
      : topic.quizzes.find((q: QuizActivity) => q.quizId === itemId);

    if (activity) {
      activity.completed = completed;
      onUpdate(); // Tell the parent component to refresh
    }
    
    // Now, call the gateway to save this change. The UI doesn't wait for this.
    await gateway.saveCompletion(unitId, itemId, itemType);
  };

  const renderVideoItem = (video: VideoActivity) => {
    const videoId = video.url || video.altUrl;
    if (!videoId) return null;
    return (
      <div key={videoId} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50">
        <Checkbox
          id={videoId}
          checked={video.completed}
          onCheckedChange={(checked: boolean) => handleItemCompletion('video', videoId, !!checked)}
        />
        <label htmlFor={videoId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <a href={videoId} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Watch Video {video.altUrl && "(+)"}
          </a>
        </label>
      </div>
    );
  };
  
  const renderQuizItem = (quiz: QuizActivity) => (
    <div key={quiz.quizId} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50">
       <Checkbox
          id={quiz.quizId}
          checked={quiz.completed}
          onCheckedChange={(checked: boolean) => handleItemCompletion('quiz', quiz.quizId, !!checked)}
        />
      <label htmlFor={quiz.quizId} className="text-sm font-medium leading-none">
        {quiz.questionPdf && <a href={quiz.questionPdf} target="_blank" rel="noopener noreferrer" className="mr-4 hover:underline">Questions PDF</a>}
        {quiz.answersPdf && <a href={quiz.answersPdf} target="_blank" rel="noopener noreferrer" className="hover:underline">Answers PDF</a>}
      </label>
    </div>
  );

  return (
    <Card className={isCompleted ? 'bg-green-50 border-green-200' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center">
          {isCompleted && <span className="mr-2 text-green-500">✅</span>}
          {topic.name}
        </CardTitle>
        <CardDescription>{topic.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {topic.videos.map(renderVideoItem)}
        {topic.quizzes.map(renderQuizItem)}
      </CardContent>
      <CardFooter>
        {!isCompleted && (
          <Button disabled>Mark Topic Completed</Button>
        )}
      </CardFooter>
    </Card>
  );
}; 