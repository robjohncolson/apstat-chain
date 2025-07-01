import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function ShadcnDemo() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">shadcn/ui Integration Demo</h1>
      
      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Example 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a card with some content. It demonstrates the new design system.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Card Example 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Another card showing the consistent styling across components.</p>
          </CardContent>
        </Card>
      </div>

      {/* Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Accordion Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern and is built with Radix UI primitives.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that matches the other components aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It's animated by default, but you can disable it if you prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 