import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Configure the plugin to use the environment variable.
// The googleAI() plugin automatically looks for process.env.GEMINI_API_KEY.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
