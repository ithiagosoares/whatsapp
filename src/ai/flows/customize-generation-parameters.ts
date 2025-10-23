'use server';

/**
 * @fileOverview Text generation flow with customizable parameters.
 *
 * - customizeGenerationParameters - A function that generates text based on a prompt and custom parameters.
 * - CustomizeGenerationParametersInput - The input type for the customizeGenerationParameters function.
 * - CustomizeGenerationParametersOutput - The return type for the customizeGenerationParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeGenerationParametersInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for text generation.'),
  maxOutputTokens: z.number().optional().describe('The maximum number of tokens to generate.'),
  model: z.string().optional().describe('The model to use for text generation.'),
  temperature: z.number().optional().describe('The temperature to use for text generation.'),
});
export type CustomizeGenerationParametersInput = z.infer<typeof CustomizeGenerationParametersInputSchema>;

const CustomizeGenerationParametersOutputSchema = z.object({
  generatedText: z.string().describe('The generated text.'),
});
export type CustomizeGenerationParametersOutput = z.infer<typeof CustomizeGenerationParametersOutputSchema>;

export async function customizeGenerationParameters(
  input: CustomizeGenerationParametersInput
): Promise<CustomizeGenerationParametersOutput> {
  return customizeGenerationParametersFlow(input);
}

const customizeGenerationParametersPrompt = ai.definePrompt({
  name: 'customizeGenerationParametersPrompt',
  input: {schema: CustomizeGenerationParametersInputSchema},
  output: {schema: CustomizeGenerationParametersOutputSchema},
  prompt: `{{{prompt}}}`,
});

const customizeGenerationParametersFlow = ai.defineFlow(
  {
    name: 'customizeGenerationParametersFlow',
    inputSchema: CustomizeGenerationParametersInputSchema,
    outputSchema: CustomizeGenerationParametersOutputSchema,
  },
  async input => {
    const {maxOutputTokens, model, temperature, prompt} = input;
    const {text} = await ai.generate({
      prompt: prompt,
      model: model,
      maxOutputTokens: maxOutputTokens,
      temperature: temperature,
    });
    return {generatedText: text};
  }
);
