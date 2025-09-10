'use server';

/**
 * @fileOverview Summarizes the complete strawberry harvest data.
 *
 * - summarizeHarvestData - A function that summarizes harvest data.
 * - SummarizeHarvestDataInput - The input type for the summarizeHarvestData function.
 * - SummarizeHarvestDataOutput - The return type for the summarizeHarvestData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHarvestDataInputSchema = z.object({
  harvestData: z
    .string()
    .describe(
      'The complete harvest data as a JSON string. Includes information such as date, batch number, kilograms, collector details, and any other relevant data.'
    ),
});
export type SummarizeHarvestDataInput = z.infer<typeof SummarizeHarvestDataInputSchema>;

const SummarizeHarvestDataOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A comprehensive summary of the strawberry harvest, highlighting key statistics, trends, and insights for agronomists to make informed decisions.'
    ),
});
export type SummarizeHarvestDataOutput = z.infer<typeof SummarizeHarvestDataOutputSchema>;

export async function summarizeHarvestData(
  input: SummarizeHarvestDataInput
): Promise<SummarizeHarvestDataOutput> {
  return summarizeHarvestDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHarvestDataPrompt',
  input: {schema: SummarizeHarvestDataInputSchema},
  output: {schema: SummarizeHarvestDataOutputSchema},
  prompt: `You are an expert agronomist tasked with summarizing strawberry harvest data to identify key trends and insights.

  Please provide a comprehensive summary of the following harvest data, highlighting key statistics such as total kilograms harvested, average yield per batch, most productive harvest dates, and any trends related to collector performance or other relevant factors.

  Harvest Data: {{{harvestData}}}
  `,
});

const summarizeHarvestDataFlow = ai.defineFlow(
  {
    name: 'summarizeHarvestDataFlow',
    inputSchema: SummarizeHarvestDataInputSchema,
    outputSchema: SummarizeHarvestDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
