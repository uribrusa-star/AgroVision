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
    .describe('JSON string con los datos de producción total (kg) y rendimiento (kg/ha).'),
  costData: z
    .string()
    .describe('JSON string con el desglose de costos en Pesos Argentinos (ARS).'),
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
      'Análisis técnico y objetivo de los datos, interpretando los resultados de producción y costos en ARS.'
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
  prompt: `Eres un consultor agrónomo experto en producción de frutillas en Argentina y analista de datos. Tu tarea es generar el contenido para un informe técnico-productivo en español, basado en los datos proporcionados. El informe debe ser profesional, claro y conciso, utilizando Pesos Argentinos (ARS) para todos los análisis financieros.

  **Instrucciones:**
  1.  **Analiza los datos en silencio**: Revisa la información de producción (kg totales y kg/ha), la estructura de costos (en ARS) y la bitácora del agrónomo.
  2.  **Redacta las siguientes secciones en español, usando un lenguaje técnico pero comprensible para un productor argentino:**

      *   **Resumen Ejecutivo**: Escribe un único párrafo que sintetice los hallazgos más importantes. Menciona el volumen total de producción, el rendimiento por hectárea y el aspecto más destacado de los costos en ARS (ej. "El costo de mano de obra representa el mayor porcentaje...").

      *   **Análisis e Interpretación**: Redacta un análisis objetivo y detallado en ARS.
          *   Comenta sobre el rendimiento de la producción ({{{productionData}}}). Compara el rendimiento total en kg y el rendimiento en kg/ha. ¿Fue bueno, malo, promedio para la región?
          *   Analiza la estructura de costos ({{{costData}}}). ¿Qué categoría tiene el mayor impacto en el costo total? ¿Son los costos de mano de obra una parte significativa? Utiliza siempre el símbolo '$' para los montos.
          *   Relaciona las actividades de la bitácora del agrónomo ({{{agronomistLogs}}}) con los resultados. ¿Las aplicaciones de insumos se reflejan en los costos? ¿Parecen haber tenido un impacto en la producción?

      *   **Conclusiones y Recomendaciones**: Basado en tu análisis, proporciona de 2 a 4 conclusiones clave y recomendaciones accionables.
          *   Las recomendaciones deben ser específicas, prácticas y relevantes para el contexto argentino. Por ejemplo: "Optimizar el calendario de riego para mejorar el calibre de la fruta y así el precio de venta final" o "Evaluar la eficiencia de los recolectores para reducir el costo de mano de obra, que representa un X% del total".
          *   Justifica cada recomendación con los datos analizados.

  **Datos para el Análisis:**
  -   **Datos de Producción y Rendimiento**: {{{productionData}}}
  -   **Datos de Costos (en ARS)**: {{{costData}}}
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
