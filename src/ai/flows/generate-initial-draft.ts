'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an initial draft of text content based on a user-provided prompt.
 *
 * - generateInitialDraft - An asynchronous function that takes a prompt as input and returns the generated text.
 * - GenerateInitialDraftInput - The input type for the generateInitialDraft function.
 * - GenerateInitialDraftOutput - The output type for the generateInitialDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialDraftInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for generating the initial draft.'),
  maxTokens: z.number().optional().describe('The maximum number of tokens to generate.'),
});
export type GenerateInitialDraftInput = z.infer<typeof GenerateInitialDraftInputSchema>;

const GenerateInitialDraftOutputSchema = z.object({
  text: z.string().describe('The generated text.'),
});
export type GenerateInitialDraftOutput = z.infer<typeof GenerateInitialDraftOutputSchema>;

export async function generateInitialDraft(input: GenerateInitialDraftInput): Promise<GenerateInitialDraftOutput> {
  return generateInitialDraftFlow(input);
}

const initialDraftPrompt = ai.definePrompt({
  name: 'initialDraftPrompt',
  input: {schema: GenerateInitialDraftInputSchema},
  output: {schema: GenerateInitialDraftOutputSchema},
  prompt: `Generate an initial draft of text content based on the following prompt:\n\n{{prompt}}`,
});

const generateInitialDraftFlow = ai.defineFlow(
  {
    name: 'generateInitialDraftFlow',
    inputSchema: GenerateInitialDraftInputSchema,
    outputSchema: GenerateInitialDraftOutputSchema,
  },
  async input => {
    const {output} = await initialDraftPrompt(input);
    return output!;
  }
);
