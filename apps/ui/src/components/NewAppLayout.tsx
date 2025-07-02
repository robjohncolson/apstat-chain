import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Toaster } from '@/components/ui/sonner';
import { NewLessonItem } from './NewLessonItem';
import { UnitCard } from './UnitCard';

// Import real curriculum data
import { ALL_UNITS_DATA } from '@apstat-chain/data';

interface NewAppLayoutProps {
  children?: React.ReactNode;
}

export function NewAppLayout({ children }: NewAppLayoutProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'unit'>('dashboard');

  // Convert curriculum data for our needs
  const units = useMemo(() => {
    return ALL_UNITS_DATA.map(unit => {
      const totalActivities = unit.topics.reduce((sum, topic) => {
        return sum + 
          topic.videos.length + 
          topic.quizzes.length + 
          (topic.blooket ? 1 : 0) + 
          (topic.origami ? 1 : 0);
      }, 0);

      const completedActivities = unit.topics.reduce((sum, topic) => {
        return sum + 
          topic.videos.filter(v => v.completed).length + 
          topic.quizzes.filter(q => q.completed).length + 
          (topic.blooket?.completed ? 1 : 0) + 
          (topic.origami ? 0 : 0); // Origami completion tracking not yet implemented
      }, 0);

      const completedTopics = unit.topics.filter(topic => {
        const topicVideos = topic.videos.length;
        const topicQuizzes = topic.quizzes.length;
        const topicBlooket = topic.blooket ? 1 : 0;
        const totalTopicActivities = topicVideos + topicQuizzes + topicBlooket;
        
        const completedTopicVideos = topic.videos.filter(v => v.completed).length;
        const completedTopicQuizzes = topic.quizzes.filter(q => q.completed).length;
        const completedTopicBlooket = topic.blooket?.completed ? 1 : 0;
        const completedTopicActivities = completedTopicVideos + completedTopicQuizzes + completedTopicBlooket;
        
        return totalTopicActivities > 0 && completedTopicActivities === totalTopicActivities;
      }).length;

      return {
        unitId: unit.unitId,
        displayName: unit.displayName,
        examWeight: unit.examWeight,
        topicsCount: unit.topics.length,
        completedTopics,
        totalActivities,
        completedActivities,
        topics: unit.topics
      };
    });
  }, []);

  // Convert topics to lesson format for NewLessonItem
  const convertTopicToLesson = (topic: any, unitId: string) => {
    const activities = [
      ...topic.videos.map((video: any, index: number) => ({
        id: `${topic.id}-video-${index}`,
        type: 'video' as const,
        title: `Video ${index + 1}`,
        description: "AP Classroom instructional video",
        url: video.url,
        completed: video.completed,
        duration: "15 min",
        points: 25
      })),
      ...topic.quizzes.map((quiz: any, index: number) => ({
        id: `${topic.id}-quiz-${index}`,
        type: 'quiz' as const,
        title: `Practice Quiz ${index + 1}`,
        description: "Test your understanding",
        url: quiz.questionPdf,
        completed: quiz.completed,
        duration: "10 min",
        points: 50
      })),
      ...(topic.blooket ? [{
        id: `${topic.id}-blooket`,
        type: 'blooket' as const,
        title: "Interactive Game",
        description: "Blooket review game",
        url: topic.blooket.url,
        completed: topic.blooket.completed,
        duration: "15 min",
        points: 20
      }] : []),
      ...(topic.origami ? [{
        id: `${topic.id}-origami`,
        type: 'origami' as const,
        title: topic.origami.name,
        description: topic.origami.description,
        url: topic.origami.videoUrl,
        completed: false,
        duration: "20 min",
        points: 15
      }] : [])
    ];

    return {
      id: `${unitId}-${topic.id}`,
      title: topic.name,
      description: topic.description,
      unitId: unitId,
      activities
    };
  };

  const selectedUnit = units.find(unit => unit.unitId === selectedUnitId);
  const selectedUnitLessons = selectedUnit ? selectedUnit.topics.map(topic => 
    convertTopicToLesson(topic, selectedUnit.unitId)
  ) : [];

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
    setViewMode('unit');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedUnitId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">AP Statistics Chain</h1>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Blockchain-Powered Learning</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
              <span>Renaissance UI</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              View Blockchain
            </Button>
            <Button size="sm">
              Mining Active
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Unit Navigation */}
        <aside className="w-80 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Course Units</h2>
              <p className="text-sm text-muted-foreground">
                Navigate through the AP Statistics curriculum
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-2" value={selectedUnitId || ""}>
              {units.map((unit) => (
                <AccordionItem key={unit.unitId} value={unit.unitId}>
                  <Card className={`border transition-all duration-200 ${
                    selectedUnitId === unit.unitId ? 'border-primary shadow-sm' : ''
                  }`}>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full text-left">
                        <div>
                          <div className="font-medium text-sm">{unit.displayName}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {unit.completedTopics}/{unit.topicsCount} topics completed
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ 
                                width: `${unit.topicsCount > 0 ? (unit.completedTopics / unit.topicsCount) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-3 space-y-2">
                        <div className="text-xs text-muted-foreground mb-3">
                          {unit.topics.length} topics • {unit.totalActivities} activities
                        </div>
                        
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {unit.topics.slice(0, 5).map((topic, index) => (
                            <div key={topic.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground truncate flex-1">
                                {topic.name}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {topic.videos.filter((v: any) => v.completed).length + 
                                 topic.quizzes.filter((q: any) => q.completed).length}/
                                {topic.videos.length + topic.quizzes.length + (topic.blooket ? 1 : 0)}
                              </Badge>
                            </div>
                          ))}
                          {unit.topics.length > 5 && (
                            <div className="text-xs text-muted-foreground">
                              +{unit.topics.length - 5} more topics...
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          variant={selectedUnitId === unit.unitId ? "default" : "ghost"} 
                          size="sm" 
                          className="w-full justify-start mt-3"
                          onClick={() => handleUnitSelect(unit.unitId)}
                        >
                          {selectedUnitId === unit.unitId ? "✨ Currently Viewing" : "View All Topics"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Blockchain Status */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Blockchain Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Height:</span>
                    <span className="font-mono">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attestations:</span>
                    <span className="font-mono">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-green-600">Connected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children || (
              <>
                {viewMode === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Welcome Header */}
                    <div className="text-center space-y-4">
                      <h1 className="text-3xl font-bold text-foreground">
                        Welcome to AP Statistics Chain
                      </h1>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your blockchain-powered learning journey through all 9 units of AP Statistics. 
                        Each completed activity is permanently recorded and verified by the network.
                      </p>
                    </div>

                    {/* Unit Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {units.map((unit) => (
                        <UnitCard
                          key={unit.unitId}
                          unitId={unit.unitId}
                          displayName={unit.displayName}
                          examWeight={unit.examWeight}
                          topicsCount={unit.topicsCount}
                          completedTopics={unit.completedTopics}
                          totalActivities={unit.totalActivities}
                          completedActivities={unit.completedActivities}
                          onClick={() => handleUnitSelect(unit.unitId)}
                          isSelected={selectedUnitId === unit.unitId}
                        />
                      ))}
                    </div>

                    {/* Progress Summary */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">Course Progress Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {units.reduce((sum, unit) => sum + unit.completedTopics, 0)} / {units.reduce((sum, unit) => sum + unit.topicsCount, 0)}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">Topics Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {units.reduce((sum, unit) => sum + unit.completedActivities, 0)} / {units.reduce((sum, unit) => sum + unit.totalActivities, 0)}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">Activities Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {units.filter(unit => unit.completedActivities === unit.totalActivities && unit.totalActivities > 0).length} / 9
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">Units Mastered</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {viewMode === 'unit' && selectedUnit && (
                  <div className="space-y-6">
                    {/* Unit Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleBackToDashboard}
                          className="mb-4"
                        >
                          ← Back to Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">
                          {selectedUnit.displayName}
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">
                            AP Exam Weight: {selectedUnit.examWeight}
                          </Badge>
                          <Badge variant="secondary">
                            {selectedUnit.completedTopics}/{selectedUnit.topicsCount} Topics Complete
                          </Badge>
                          <Badge variant="secondary">
                            {selectedUnit.completedActivities}/{selectedUnit.totalActivities} Activities Complete
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div className="space-y-6">
                      {selectedUnitLessons.map((lesson) => (
                        <NewLessonItem key={lesson.id} lesson={lesson} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
} 