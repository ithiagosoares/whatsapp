"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface GenerationConfig {
  maxLength: number;
  temperature: number;
  model: string;
}

interface GeneratorContextType {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  generatedText: string;
  setGeneratedText: React.Dispatch<React.SetStateAction<string>>;
  suggestedElements: string[];
  setSuggestedElements: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GeneratorContext = createContext<GeneratorContextType | undefined>(undefined);

export function GeneratorProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<string>('A landing page for a new AI-powered code assistant.');
  const [config, setConfig] = useState<GenerationConfig>({
    maxLength: 512,
    temperature: 0.7,
    model: 'gemini-1.5-flash',
  });
  const [generatedText, setGeneratedText] = useState<string>('');
  const [suggestedElements, setSuggestedElements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value = {
    prompt,
    setPrompt,
    config,
    setConfig,
    generatedText,
    setGeneratedText,
    suggestedElements,
    setSuggestedElements,
    isLoading,
    setIsLoading,
  };

  return (
    <GeneratorContext.Provider value={value}>
      {children}
    </GeneratorContext.Provider>
  );
}

export function useGenerator(): GeneratorContextType {
  const context = useContext(GeneratorContext);
  if (context === undefined) {
    throw new Error('useGenerator must be used within a GeneratorProvider');
  }
  return context;
}
