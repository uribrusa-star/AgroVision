import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-harvest-data.ts';
import '@/ai/flows/validate-production-data.ts';
import '@/ai/flows/summarize-agronomist-report.ts';
import '@/ai/flows/predict-yield.ts';
