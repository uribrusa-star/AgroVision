'use server';

/**
 * @fileOverview Summarizes the complete strawberry harvest data for a professional report.
 *
 * - summarizeHarvestData - A function that summarizes harvest data for a PDF report.
 * - SummarizeHarvestDataInput - The input type for the summarizeHarvestData function.
 * - SummarizeHarvestDataOutput - The return type for the summarizeHarvestData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHarvestDataInputSchema = z.object({
  productionData: z
    .string()
    .describe('JSON string con los datos de producción total, rendimiento, etc.'),
  costData: z
    .string()
    .describe('JSON string con el desglose de costos (mano de obra, etc.).'),
  agronomistLogs: z
    .string()
    .describe('JSON string con la bitácora del agrónomo (fertilización, fumigación).'),
});
export type SummarizeHarvestDataInput = z.infer<typeof SummarizeHarvestDataInputSchema>;

const SummarizeHarvestDataOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Un párrafo breve y claro que sintetice la información principal.'),
  analysisAndInterpretation: z
    .string()
    .describe(
      'Análisis técnico y objetivo de los datos, interpretando los resultados de producción y costos.'
    ),
  conclusionsAndRecommendations: z
    .string()
    .describe(
      'Conclusiones clave y recomendaciones accionables para el productor.'
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
  prompt: `Eres un consultor agrónomo experto en la producción de frutillas y analista de datos. Tu tarea es generar el contenido para un informe técnico-productivo en español, basado en los datos proporcionados. El informe debe ser profesional, claro y conciso.

  **Instrucciones:**
  1.  **Analiza los datos en silencio**: Revisa toda la información de producción, costos y la bitácora del agrónomo.
  2.  **Redacta las siguientes secciones en español, usando un lenguaje técnico pero comprensible para un productor:**

      *   **Resumen Ejecutivo**: Escribe un único párrafo que sintetice los hallazgos más importantes del período. Menciona el volumen total de producción, el rendimiento principal y el aspecto más destacado de los costos. Sé directo y claro.

      *   **Análisis e Interpretación**: Redacta un análisis objetivo y detallado.
          *   Comenta sobre el rendimiento de la producción ({{{productionData}}}). ¿Fue bueno, malo, promedio? ¿Qué factores podrían haber influido?
          *   Analiza la estructura de costos ({{{costData}}}). ¿Son los costos de mano de obra una parte significativa? ¿Qué se puede inferir de los costos de insumos registrados en la bitácora ({{{agronomistLogs}}})?
          *   Relaciona las actividades de la bitácora del agrónomo con los resultados. ¿Las fertilizaciones o controles parecen haber tenido un impacto?

      *   **Conclusiones y Recomendaciones**: Basado en tu análisis, proporciona de 2 a 4 conclusiones clave y recomendaciones accionables.
          *   Las recomendaciones deben ser específicas y prácticas. Por ejemplo: "Optimizar el calendario de riego en la fase de floración para mejorar el calibre de la fruta" o "Evaluar la eficiencia de los recolectores para reducir costos de mano de obra".
          *   Cada recomendación debe estar justificada por los datos analizados.

  **Datos para el Análisis:**
  -   **Datos de Producción y Rendimiento**: {{{productionData}}}
  -   **Datos de Costos**: {{{costData}}}
  -   **Bitácora del Agrónomo**: {{{agronomistLogs}}}

  Genera únicamente el contenido para las secciones solicitadas en el formato de salida JSON especificado.
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
