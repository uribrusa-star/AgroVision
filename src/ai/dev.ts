import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-harvest-data.ts';
import '@/ai/flows/validate-production-data.ts';