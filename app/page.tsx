"use client";
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types and Interfaces
interface LoadingState {
  reflection: boolean;
  milestone: boolean;
}

interface ErrorState {
  reflection: string | null;
  milestone: string | null;
}

interface Analysis {
  sentiment: {
    label: string;
    score?: number;
  };
  topics: string[];
}

interface Reflection {
  id?: string;
  content: string;
  path: string;
  userId: string;
  mediaType: 'text' | 'image' | 'video';
  tags?: string[];
  timestamp?: string;
  analysis?: Analysis;
}

interface AIRecommendations {
  strategies: string[];
  nextSteps: string[];
}

interface Milestone {
  id?: string;
  title: string;
  description: string;
  path: string;
  targetDate: string;
  userId: string;
  aiRecommendations?: AIRecommendations;
}

type Path = 'personal' | 'career' | 'health' | 'creativity';

const GrowthTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('reflections');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    reflection: false,
    milestone: false
  });
  const [error, setError] = useState<ErrorState>({
    reflection: null,
    milestone: null
  });

  const paths: Path[] = ['personal', 'career', 'health', 'creativity'];

  const clearError = (type: keyof ErrorState): void => {
    setError(prev => ({ ...prev, [type]: null }));
  };

  // Handle new reflection submission
  const handleReflectionSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, reflection: true }));
    clearError('reflection');

    const formData = new FormData(e.currentTarget);
    const reflection: Reflection = {
      content: formData.get('content') as string,
      path: formData.get('path') as Path,
      userId: '507f191e810c19729de860ea',
      mediaType: 'text',
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || []
    };

    try {
      const response = await fetch('https://silicon-backend.onrender.com/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reflection),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Reflection = await response.json();
      setReflections(prev => [data, ...prev]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(prev => ({
        ...prev,
        reflection: err instanceof Error ? err.message : 'Failed to submit reflection'
      }));
    } finally {
      setLoading(prev => ({ ...prev, reflection: false }));
    }
  };

  // Handle new milestone submission
  const handleMilestoneSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, milestone: true }));
    clearError('milestone');

    const formData = new FormData(e.currentTarget);
    const milestone: Milestone = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      path: formData.get('path') as Path,
      targetDate: formData.get('targetDate') as string,
      userId: '507f191e810c19729de860ea',
    };

    try {
      const response = await fetch('https://silicon-backend.onrender.com/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Milestone = await response.json();
      setMilestones(prev => [data, ...prev]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(prev => ({
        ...prev,
        milestone: err instanceof Error ? err.message : 'Failed to submit milestone'
      }));
    } finally {
      setLoading(prev => ({ ...prev, milestone: false }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Personal Growth Tracker</h1>
        <p className="text-gray-600">Track your journey of personal development and growth</p>
      </header>

      <Tabs defaultValue="reflections" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="reflections">Daily Reflections</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Reflections Tab */}
        <TabsContent value="reflections">
          <Card>
            <CardHeader>
              <CardTitle>New Reflection</CardTitle>
              <CardDescription>Share your thoughts and experiences</CardDescription>
            </CardHeader>
            <CardContent>
              {error.reflection && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error.reflection}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleReflectionSubmit} className="space-y-4">
                <div>
                  <Select name="path" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a path" />
                    </SelectTrigger>
                    <SelectContent>
                      {paths.map((path) => (
                        <SelectItem key={path} value={path}>
                          {path.charAt(0).toUpperCase() + path.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  name="content"
                  placeholder="What's on your mind today?"
                  required
                  className="min-h-32"
                />
                <Input name="tags" placeholder="Add tags (comma-separated)" />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading.reflection}
                >
                  {loading.reflection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Reflection'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            {reflections.map((reflection, index) => (
              <Card key={reflection.id || index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="capitalize">{reflection.path}</CardTitle>
                    <span className="text-sm text-gray-500">
                      {reflection.timestamp && new Date(reflection.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{reflection.content}</p>
                  {reflection.tags && reflection.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {reflection.tags.map((tag, i) => (
                        <span key={i} className="text-sm bg-gray-100 rounded-full px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {reflection.analysis && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Sentiment</p>
                          <p className="text-sm text-gray-600">
                            {reflection.analysis.sentiment.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Key Topics</p>
                          <p className="text-sm text-gray-600">
                            {reflection.analysis.topics.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>New Milestone</CardTitle>
              <CardDescription>Set your next goal</CardDescription>
            </CardHeader>
            <CardContent>
              {error.milestone && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error.milestone}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                <Input name="title" placeholder="Milestone Title" required />
                <Textarea
                  name="description"
                  placeholder="Describe your milestone"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select name="path" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a path" />
                    </SelectTrigger>
                    <SelectContent>
                      {paths.map((path) => (
                        <SelectItem key={path} value={path}>
                          {path.charAt(0).toUpperCase() + path.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input name="targetDate" type="date" required className="w-full" />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading.milestone}
                >
                  {loading.milestone ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Milestone'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={milestone.id || index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{milestone.title}</CardTitle>
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <CardDescription>{milestone.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {milestone.aiRecommendations && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">Strategies</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {milestone.aiRecommendations.strategies.length > 0 ? (
                            milestone.aiRecommendations.strategies.map((strategy, i) => (
                              <li key={i}>{strategy}</li>
                            ))
                          ) : (
                            <li>No strategies available.</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Next Steps</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {milestone.aiRecommendations.nextSteps.length > 0 ? (
                            milestone.aiRecommendations.nextSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))
                          ) : (
                            <li>No next steps available.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Personalized analysis of your growth journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Progress Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {paths.map((path) => (
                      <Card key={path}>
                        <CardHeader>
                          <CardTitle className="text-base capitalize">{path}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className="h-full bg-blue-500 rounded"
                              style={{
                                width: `${Math.random() * 100}%`,
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Patterns</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Analysis of your recent reflections and milestones will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrowthTracker