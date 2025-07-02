import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NewLessonItem } from './NewLessonItem';

interface NewAppLayoutProps {
  children?: React.ReactNode;
}

export function NewAppLayout({ children }: NewAppLayoutProps) {
  // Mock data for demonstration
  const units = [
    { id: 1, title: "Unit 1: Exploring Data", lessons: 12, completed: 8 },
    { id: 2, title: "Unit 2: Sampling and Experimentation", lessons: 10, completed: 5 },
    { id: 3, title: "Unit 3: Anticipating Patterns", lessons: 15, completed: 2 },
    { id: 4, title: "Unit 4: Statistical Inference", lessons: 18, completed: 0 },
  ];

  // Mock lesson data to demonstrate the new NewLessonItem component
  const mockLessons = [
    {
      id: "lesson-1-1",
      title: "Introduction to Data and Statistics",
      description: "Learn the fundamentals of statistical thinking and data collection methods",
      unitId: "unit1",
      activities: [
        {
          id: "video-1-1-1",
          type: "video" as const,
          title: "What is Statistics?",
          description: "Explore the role of statistics in understanding our world",
          url: "https://apclassroom.collegeboard.org/example",
          completed: true,
          duration: "15 min",
          points: 25
        },
        {
          id: "quiz-1-1-1",
          type: "quiz" as const,
          title: "Statistics Fundamentals Quiz",
          description: "Test your understanding of basic statistical concepts",
          url: "https://example.com/quiz",
          completed: true,
          duration: "10 min",
          points: 50
        },
        {
          id: "blooket-1-1-1",
          type: "blooket" as const,
          title: "Data Types Game",
          description: "Interactive game to identify different types of data",
          url: "https://blooket.com/example",
          completed: false,
          duration: "15 min",
          points: 15
        },
        {
          id: "origami-1-1-1",
          type: "origami" as const,
          title: "Data Collection Crane",
          description: "Fold a crane while learning about data collection methods",
          url: "https://youtube.com/example",
          completed: false,
          duration: "20 min",
          points: 10
        }
      ]
    },
    {
      id: "lesson-1-2",
      title: "Categorical vs Quantitative Data",
      description: "Distinguish between different types of variables and measurement scales",
      unitId: "unit1",
      activities: [
        {
          id: "video-1-2-1",
          type: "video" as const,
          title: "Types of Variables",
          description: "Learn to identify categorical and quantitative variables",
          url: "https://apclassroom.collegeboard.org/example2",
          completed: false,
          duration: "18 min",
          points: 25
        },
        {
          id: "video-1-2-2",
          type: "video" as const,
          title: "Levels of Measurement",
          description: "Understand nominal, ordinal, interval, and ratio scales",
          url: "https://apclassroom.collegeboard.org/example3",
          completed: false,
          duration: "22 min",
          points: 25
        },
        {
          id: "quiz-1-2-1",
          type: "quiz" as const,
          title: "Variable Classification Quiz",
          description: "Practice identifying different types of variables",
          url: "https://example.com/quiz2",
          completed: false,
          duration: "12 min",
          points: 50
        }
      ]
    },
    {
      id: "lesson-2-1",
      title: "Sampling Methods and Bias",
      description: "Explore different sampling techniques and potential sources of bias",
      unitId: "unit2",
      activities: [
        {
          id: "video-2-1-1",
          type: "video" as const,
          title: "Random Sampling Techniques",
          description: "Learn about simple random, stratified, and cluster sampling",
          url: "https://apclassroom.collegeboard.org/sampling",
          completed: true,
          duration: "25 min",
          points: 30
        },
        {
          id: "blooket-2-1-1",
          type: "blooket" as const,
          title: "Sampling Bias Detective",
          description: "Identify bias in different sampling scenarios",
          url: "https://blooket.com/sampling",
          completed: true,
          duration: "20 min",
          points: 20
        },
        {
          id: "quiz-2-1-1",
          type: "quiz" as const,
          title: "Sampling Methods Assessment",
          description: "Comprehensive quiz on sampling techniques and bias",
          url: "https://example.com/sampling-quiz",
          completed: false,
          duration: "15 min",
          points: 50
        }
      ]
    }
  ];

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

            <Accordion type="single" collapsible className="space-y-2">
              {units.map((unit) => (
                <AccordionItem key={unit.id} value={`unit-${unit.id}`}>
                  <Card className="border">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full text-left">
                        <div>
                          <div className="font-medium text-sm">{unit.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {unit.completed}/{unit.lessons} lessons completed
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(unit.completed / unit.lessons) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-3 space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Lessons and activities for this unit will appear here
                        </div>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          View All Lessons
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
              <div className="space-y-6">
                {/* Phase Implementation Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Phase 3.2: Lesson Item Redesign - Complete! 🎉</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Behold the new NewLessonItem component! Built from scratch with shadcn/ui components,
                      this design prioritizes learning materials and creates an engaging, accessible interface
                      for students to interact with their coursework.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Card-based lesson containers with visual hierarchy</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Prominent activity buttons using modern Button components</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Progress visualization with Badge and Progress components</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Celebration animations and blockchain attestation messaging</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Demonstrations */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Lesson Demonstrations</h2>
                    <p className="text-muted-foreground mb-6">
                      Here are sample lessons showcasing the new design. Notice how learning activities 
                      are now the visual priority, with clear calls-to-action and engaging progress feedback.
                    </p>
                  </div>

                  {mockLessons.map((lesson) => (
                    <NewLessonItem key={lesson.id} lesson={lesson} />
                  ))}
                </div>

                {/* Next Steps */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-blue-700 dark:text-blue-300">Ready for Phase 3.3: Dashboard & Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      With the lesson item redesign complete, we're ready to move on to enhancing the dashboard
                      and navigation experience. The foundation is solid, and the learning materials now shine!
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 