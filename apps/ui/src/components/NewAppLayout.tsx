import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                {/* Welcome Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to the UI Renaissance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      This is the new layout foundation for our blockchain-powered learning platform.
                      The interface has been rebuilt with shadcn/ui components to provide a modern,
                      accessible, and engaging experience.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Modern Design</h3>
                          <p className="text-sm text-muted-foreground">
                            Contemporary UI patterns that communicate platform quality
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Accessible</h3>
                          <p className="text-sm text-muted-foreground">
                            WCAG compliant components built on Radix UI primitives
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Blockchain Ready</h3>
                          <p className="text-sm text-muted-foreground">
                            Designed to elegantly visualize decentralized learning
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase Implementation Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Phase 3.1: Foundation Complete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">shadcn/ui Integration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Core Layout Architecture</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Foundational Components (Button, Card, Accordion, Sonner)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Ready for Phase 3.2: Lesson Item Redesign</span>
                      </div>
                    </div>
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