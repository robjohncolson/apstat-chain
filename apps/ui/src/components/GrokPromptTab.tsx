import React, { useState } from 'react';
import { gateway } from '@apstat-chain/core';
import type { CurriculumUnit } from '@apstat-chain/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TopicCard } from './TopicCard';

interface GrokPromptTabProps {
  units: CurriculumUnit[];
  onUpdate: () => void;
}

export const GrokPromptTab = ({ units, onUpdate }: GrokPromptTabProps) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');
  const promptText = gateway.getGrokPrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Logic to find the current topic across all units
  let currentUnit: CurriculumUnit | undefined;
  let currentTopic;

  for (const unit of units) {
    const topic = unit.topics.find(t => t.current);
    if (topic) {
      currentUnit = unit;
      currentTopic = topic;
      break;
    }
  }

  // Fallback to the first topic of the first unit if no 'current' topic is set
  if (!currentTopic && units.length > 0 && units[0].topics.length > 0) {
    currentUnit = units[0];
    currentTopic = units[0].topics[0];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Prompt and Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tutor Prompt</CardTitle>
          <CardDescription>Copy this prompt and paste it into Grok to start your guided learning session.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-slate-100 rounded-md whitespace-pre-wrap text-sm mb-4 overflow-auto max-h-96">
            {promptText}
          </pre>
          <div className="flex gap-2">
            <Button onClick={handleCopy}>{copyButtonText}</Button>
            <Button asChild variant="secondary">
              <a href="https://grok.com" target="_blank" rel="noopener noreferrer">Open Grok</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Current Topic Materials */}
      <div>
        {currentUnit && currentTopic ? (
          <TopicCard unitId={currentUnit.unitId} topic={currentTopic} onUpdate={onUpdate} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Current Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please select a topic from the "Study Materials" tab to begin.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 