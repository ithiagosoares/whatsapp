"use client";

import { customizeGenerationParameters } from '@/ai/flows/customize-generation-parameters';
import { suggestUiElements } from '@/ai/flows/suggest-ui-elements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useGenerator } from '@/context/generator-context';
import { Bot, Sparkles, Type, Component, Wand2 } from 'lucide-react';
import UiElementRenderer from './ui-element-renderer';

export default function MainContent() {
  const {
    prompt,
    setPrompt,
    config,
    generatedText,
    setGeneratedText,
    suggestedElements,
    setSuggestedElements,
    isLoading,
    setIsLoading,
  } = useGenerator();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate content.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedText('');
    setSuggestedElements([]);

    try {
      const [textResult, uiResult] = await Promise.all([
        customizeGenerationParameters({
          prompt: `Based on the following prompt, generate a piece of text. Keep it concise and relevant.\n\nPrompt: "${prompt}"`,
          maxOutputTokens: config.maxLength,
          temperature: config.temperature,
        }),
        suggestUiElements({ prompt }),
      ]);

      if (textResult?.generatedText) {
        setGeneratedText(textResult.generatedText);
      }
      if (uiResult?.uiElements) {
        setSuggestedElements(uiResult.uiElements);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'An error occurred while generating content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen">
        <main className="p-4 md:p-8 flex flex-col gap-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">AI Content & UI Generator</h1>
                    <p className="text-muted-foreground">
                        Describe your idea, and let AI generate content and suggest UI components.
                    </p>
                </div>
                 <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm">
                    {isLoading ? (
                        <>
                            <Bot className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate
                        </>
                    )}
                </Button>
            </header>

            <div className="space-y-4">
                <Label htmlFor="prompt-input" className="text-lg font-headline">Your Prompt</Label>
                <Textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A marketing email for a new productivity app..."
                    className="min-h-[120px] text-base"
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                           <Type className="w-5 h-5"/> Generated Text
                        </CardTitle>
                        <CardDescription>AI-generated text based on your prompt.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                           <div className="space-y-3">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-4/5" />
                             <Skeleton className="h-4 w-2/3" />
                           </div>
                        ) : generatedText ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedText}</p>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <Sparkles className="mx-auto h-8 w-8 mb-2" />
                                <p>Your generated text will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Component className="w-5 h-5" /> Suggested UI Elements
                        </CardTitle>
                        <CardDescription>AI-suggested UI components for your idea.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                           <div className="grid grid-cols-2 gap-4">
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                           </div>
                        ) : suggestedElements.length > 0 ? (
                           <UiElementRenderer elements={suggestedElements} />
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <Sparkles className="mx-auto h-8 w-8 mb-2" />
                                <p>Suggested UI elements will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    </ScrollArea>
  );
}
