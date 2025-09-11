'use server';

/**
 * @fileOverview Predicts future crop yield based on various data points.
 *
 * - predictYield - A function that calls the prediction flow.
 * - PredictYieldInput - The input type for the function.
 * - PredictYieldOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictYieldInputSchema = z.object({
  batchId: z.string().describe('El ID del lote para el cual se hace la predicción.'),
  recentHarvests: z.string().describe('JSON string con los datos de las últimas cosechas del lote.'),
  agronomistLogs: z.string().describe('JSON string con la bitácora de actividades agronómicas recientes (fertilización, riego, etc.).'),
  phenologyLogs: z.string().describe('JSON string con la bitácora de seguimiento fenológico reciente (floración, fructificación).'),
  environmentalLogs: z.string().describe('JSON string con los registros de condiciones ambientales recientes (temperatura, humedad).'),
  weatherForecast: z.string().describe('Pronóstico del tiempo para los próximos 7 días (ej. "soleado con aumento de temperatura", "posibles lluvias aisladas").'),
});
export type PredictYieldInput = z.infer<typeof PredictYieldInputSchema>;

const PredictYieldOutputSchema = z.object({
  prediction: z
    .string()
    .describe(
      'Una predicción de rendimiento para la próxima semana, cualitativa y concisa. Debe incluir un porcentaje estimado de cambio (aumento/disminución) y las razones clave.'
    ),
  confidence: z
    .enum(['Alta', 'Media', 'Baja'])
    .describe('El nivel de confianza en la predicción.'),
});
export type PredictYieldOutput = z.infer<typeof PredictYieldOutputSchema>;

export async function predictYield(
  input: PredictYieldInput
): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictYieldPrompt',
  input: {schema: PredictYieldInputSchema},
  output: {schema: PredictYieldOutputSchema},
  prompt: `Eres un ingeniero agrónomo experto en frutillas con capacidades de análisis de datos y modelado predictivo. Tu tarea es generar una proyección de rendimiento para un lote específico para la próxima semana.

  **Instrucciones:**
  1.  **Analiza en silencio los datos proporcionados**: Revisa los datos de cosechas recientes, las actividades agronómicas, el estado fenológico del cultivo, las condiciones ambientales pasadas y el pronóstico del tiempo.
  2.  **Sintetiza la información**: Identifica los factores clave que influirán en el rendimiento. Por ejemplo:
      *   ¿Una fertilización reciente de Fructificación o Maduración podría impulsar la producción?
      *   ¿Un aumento en el número de flores/frutos reportado en la fenología se traducirá en una mayor cosecha?
      *   ¿Las condiciones climáticas pronosticadas (ej. temperaturas ideales, estrés por calor, heladas) favorecerán o perjudicarán el desarrollo y maduración de la fruta?
      *   ¿La tendencia de las cosechas recientes es ascendente, descendente o estable?
  3.  **Genera una Predicción (en español)**:
      *   Redacta una predicción clara y concisa (máximo 2-3 frases).
      *   Debe incluir una **estimación porcentual** del cambio en el rendimiento (ej. "aumento del 10-15%", "disminución del 5%", "rendimiento estable").
      *   Justifica la predicción mencionando **1 o 2 de los factores más influyentes** que identificaste. Por ejemplo: "...debido a las óptimas temperaturas pronosticadas y la reciente aplicación de fertilizantes de engorde."
  4.  **Establece el Nivel de Confianza**: Basado en la calidad y consistencia de los datos, determina si tu confianza en la predicción es 'Alta', 'Media' o 'Baja'. Por ejemplo, si faltan datos de fenología o el pronóstico es muy incierto, la confianza podría ser 'Media' o 'Baja'.

  **Datos para el Análisis:**
  -   **Lote a Predecir**: {{{batchId}}}
  -   **Cosechas Recientes del Lote**: {{{recentHarvests}}}
  -   **Actividades Agronómicas Recientes**: {{{agronomistLogs}}}
  -   **Fenología Reciente**: {{{phenologyLogs}}}
  -   **Condiciones Ambientales Pasadas**: {{{environmentalLogs}}}
  -   **Pronóstico Climático (7 días)**: {{{weatherForecast}}}

  Genera únicamente el contenido para la predicción y la confianza en el formato de salida JSON especificado.
  `,
});

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
