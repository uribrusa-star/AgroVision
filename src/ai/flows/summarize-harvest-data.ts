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
  prompt: `Eres un experto agrónomo y analista de datos. Tu tarea es generar un "Resumen Ejecutivo" detallado y profesional en español basado en los datos de cosecha de fresas proporcionados.

  El resumen debe estar estructurado en las siguientes secciones, cada una con su título en negrita:

  1.  **Análisis General de Producción**:
      *   Calcula y presenta el total de kilogramos cosechados.
      *   Identifica el lote (batchNumber) más productivo y el menos productivo.
      *   Menciona el día de mayor cosecha.

  2.  **Análisis de Rendimiento de Recolectores**:
      *   Identifica al recolector más productivo (total de kg y/o promedio).
      *   Menciona cualquier tendencia o patrón interesante en el rendimiento de los recolectores.

  3.  **Análisis de Tendencias Temporales**:
      *   Describe si la producción muestra una tendencia ascendente, descendente o estable a lo largo del tiempo.
      *   Identifica cualquier patrón estacional o mensual si los datos lo permiten.

  4.  **Recomendaciones Clave**:
      *   Basado en los datos, proporciona 2-3 recomendaciones accionables para optimizar la cosecha, mejorar la productividad o investigar posibles problemas.

  Utiliza un tono formal y analítico. Presenta los datos de forma clara y concisa.

  Datos de Cosecha: {{{harvestData}}}
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
