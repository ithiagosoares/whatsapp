"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AlertCircle, Terminal } from 'lucide-react';

type ElementMap = {
  [key: string]: React.ComponentType<any>;
};

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

const elementMap: ElementMap = {
  Alert: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Alert</AlertTitle>
      <AlertDescription>This is an alert component.</AlertDescription>
    </Alert>
  ),
  Avatar: () => (
    <Avatar>
      <AvatarImage src={userAvatar?.imageUrl} alt="User Avatar" />
      <AvatarFallback>AV</AvatarFallback>
    </Avatar>
  ),
  Badge: () => <Badge>Badge</Badge>,
  Button: () => <Button>Button</Button>,
  Card: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is a card element.</p>
      </CardContent>
    </Card>
  ),
  Checkbox: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checkbox-demo" />
      <Label htmlFor="checkbox-demo">Checkbox</Label>
    </div>
  ),
  Input: () => <Input placeholder="Input Field" />,
  Progress: () => {
    const [progress, setProgress] = React.useState(13);
    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);
    return <Progress value={progress} className="w-[60%]" />;
  },
  'Radio Group': () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="r1" />
        <Label htmlFor="r1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="r2" />
        <Label htmlFor="r2">Option Two</Label>
      </div>
    </RadioGroup>
  ),
  Select: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  ),
  Slider: () => <Slider defaultValue={[50]} max={100} step={1} />,
  Switch: () => (
    <div className="flex items-center space-x-2">
      <Switch id="switch-demo" />
      <Label htmlFor="switch-demo">Switch</Label>
    </div>
  ),
  Tabs: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">This is the account tab.</TabsContent>
      <TabsContent value="password">This is the password tab.</TabsContent>
    </Tabs>
  ),
};

// Normalize names from AI to match map keys
const normalizeElementName = (name: string): string => {
  const lowerName = name.toLowerCase().trim();
  if (lowerName.includes('radio')) return 'Radio Group';
  for (const key in elementMap) {
    if (key.toLowerCase() === lowerName) {
      return key;
    }
  }
  return name;
};

export default function UiElementRenderer({ elements }: { elements: string[] }) {
  if (!elements || elements.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {elements.map((name, index) => {
        const normalizedName = normalizeElementName(name);
        const Component = elementMap[normalizedName];

        return (
          <div key={`${name}-${index}`} className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
            <p className="font-mono text-sm text-muted-foreground">{normalizedName}</p>
            <div className="flex-grow flex items-center justify-center min-h-[60px]">
              {Component ? <Component /> : (
                 <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>(No component preview)</span>
                 </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
