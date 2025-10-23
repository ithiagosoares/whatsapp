"use client";

import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Slider } from '@/components/ui/slider';
import { useGenerator, type GenerationConfig } from '@/context/generator-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookMarked, Bot, Save, Trash2 } from 'lucide-react';
import { Logo } from './logo';

export default function AppSidebar() {
  const { prompt, setPrompt, config, setConfig } = useGenerator();
  const [savedPrompts, setSavedPrompts] = useLocalStorage<string[]>('saved-prompts', []);

  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const handleConfigChange = (key: keyof GenerationConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSavePrompt = () => {
    if (prompt && !savedPrompts.includes(prompt)) {
      setSavedPrompts([prompt, ...savedPrompts]);
    }
  };

  const handleDeletePrompt = (promptToDelete: string) => {
    setSavedPrompts(savedPrompts.filter(p => p !== promptToDelete));
  };


  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-full px-2">
          <div className="p-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="max-length">Max Length: {config.maxLength}</Label>
                  <Slider
                    id="max-length"
                    min={64}
                    max={2048}
                    step={64}
                    value={[config.maxLength]}
                    onValueChange={([value]) => handleConfigChange('maxLength', value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[config.temperature]}
                    onValueChange={([value]) => handleConfigChange('temperature', value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={config.model}
                    onValueChange={(value) => handleConfigChange('model', value)}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      <SelectItem value="gemini-pro" disabled>Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BookMarked className="w-5 h-5" />
                    Saved Prompts
                </CardTitle>
                <CardDescription>Save and reuse your favorite prompts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSavePrompt} className="w-full" disabled={!prompt}>
                    <Save className="mr-2 h-4 w-4" /> Save Current Prompt
                </Button>
                <SidebarMenu className="mt-4">
                  {savedPrompts.length > 0 ? (
                    savedPrompts.map((p, i) => (
                      <SidebarMenuItem key={i} className="group/item">
                        <button onClick={() => setPrompt(p)} className="text-left text-sm p-2 rounded-md hover:bg-sidebar-accent w-full truncate">
                          {p}
                        </button>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100"
                            onClick={() => handleDeletePrompt(p)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">No saved prompts yet.</p>
                  )}
                </SidebarMenu>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Card className="flex items-center p-2 gap-3">
          <Avatar>
            <AvatarImage asChild src={userAvatar?.imageUrl} alt="User">
                <Image data-ai-hint={userAvatar?.imageHint} src={userAvatar?.imageUrl ?? ''} width={40} height={40} alt="User avatar" />
            </AvatarImage>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-grow truncate">
            <p className="text-sm font-semibold">User</p>
            <p className="text-xs text-muted-foreground">Welcome back!</p>
          </div>
        </Card>
      </SidebarFooter>
    </>
  );
}
