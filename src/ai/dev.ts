import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-draft.ts';
import '@/ai/flows/customize-generation-parameters.ts';
import '@/ai/flows/suggest-ui-elements.ts';