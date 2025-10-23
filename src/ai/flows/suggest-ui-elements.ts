'use server';

/**
 * @fileOverview Suggests relevant UI elements based on a text prompt.
 *
 * - suggestUiElements - A function that suggests UI elements based on a text prompt.
 * - SuggestUiElementsInput - The input type for the suggestUiElements function.
 * - SuggestUiElementsOutput - The return type for the suggestUiElements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUiElementsInputSchema = z.object({
  prompt: z.string().describe('The text prompt to base the UI elements on.'),
});
export type SuggestUiElementsInput = z.infer<typeof SuggestUiElementsInputSchema>;

const SuggestUiElementsOutputSchema = z.object({
  uiElements: z
    .array(z.string())
    .describe('An array of suggested UI elements based on the prompt.'),
});
export type SuggestUiElementsOutput = z.infer<typeof SuggestUiElementsOutputSchema>;

export async function suggestUiElements(input: SuggestUiElementsInput): Promise<SuggestUiElementsOutput> {
  return suggestUiElementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUiElementsPrompt',
  input: {schema: SuggestUiElementsInputSchema},
  output: {schema: SuggestUiElementsOutputSchema},
  prompt: `You are a UI/UX expert. Given the following prompt, suggest a list of relevant UI elements that would be appropriate for the user interface. Respond as a JSON array of strings. Be as specific as possible.

Prompt: {{{prompt}}}`,
});

const suggestUiElementsFlow = ai.defineFlow(
  {
    name: 'suggestUiElementsFlow',
    inputSchema: SuggestUiElementsInputSchema,
    outputSchema: SuggestUiElementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
