'use server';

/**
 * @fileOverview Generates agronomic alerts based on weather forecasts.
 *
 * - generateWeatherAlerts - A function that calls the alert generation flow.
 * - GenerateWeatherAlertsInput - The input type for the function.
 * - GenerateWeatherAlertsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeatherAlertsInputSchema = z.object({
  weatherForecast: z.string().describe('Un resumen del pronóstico del tiempo para los próximos días (ej. "fuertes lluvias y vientos", "ola de calor con temperaturas sobre 35°C", "riesgo de heladas").'),
  phenologyLogs: z.string().describe('JSON string con la bitácora de seguimiento fenológico reciente (floración, fructificación, etc.) para entender el estado actual del cultivo.'),
});
export type GenerateWeatherAlertsInput = z.infer<typeof GenerateWeatherAlertsInputSchema>;

const AlertSchema = z.object({
    risk: z.string().describe('El riesgo principal identificado (ej. "Estrés por calor", "Daño por granizo", "Aumento de Botrytis").'),
    recommendation: z.string().describe('Una recomendación clara y accionable para que el agrónomo mitigue el riesgo.'),
    urgency: z.enum(['Alta', 'Media', 'Baja']).describe('El nivel de urgencia de la alerta.')
});

const GenerateWeatherAlertsOutputSchema = z.object({
  alerts: z.array(AlertSchema).describe('Un arreglo de una o más alertas y recomendaciones generadas por la IA.'),
});
export type GenerateWeatherAlertsOutput = z.infer<typeof GenerateWeatherAlertsOutputSchema>;

export async function generateWeatherAlerts(
  input: GenerateWeatherAlertsInput
): Promise<GenerateWeatherAlertsOutput> {
  return generateWeatherAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherAlertsPrompt',
  input: {schema: GenerateWeatherAlertsInputSchema},
  output: {schema: GenerateWeatherAlertsOutputSchema},
  prompt: `Eres un ingeniero agrónomo experto en el cultivo de frutillas, especializado en gestión de riesgos climáticos. Tu tarea es generar alertas y recomendaciones basadas en un pronóstico del tiempo.

  **Instrucciones:**
  1.  **Analiza en silencio los datos proporcionados**: Revisa el pronóstico del tiempo y el estado fenológico del cultivo.
  2.  **Identifica los riesgos clave**: Relaciona el pronóstico con la etapa del cultivo.
      *   Una ola de calor durante la floración puede causar aborto floral (riesgo alto).
      *   Lluvias persistentes durante la maduración pueden provocar Botrytis (riesgo alto).
      *   Una helada en cualquier etapa es un riesgo crítico.
      *   Vientos fuertes pueden dañar los túneles o las plantas.
  3.  **Genera Alertas y Recomendaciones (en español)**:
      *   Para cada riesgo significativo, crea un objeto de alerta.
      *   **Riesgo**: Sé conciso y claro. Ej: "Riesgo de Botrytis por alta humedad".
      *   **Recomendación**: Debe ser una acción concreta. Ej: "Asegurar ventilación adecuada de los túneles y preparar aplicación preventiva de fungicida".
      *   **Urgencia**: Determina la urgencia ('Alta', 'Media', 'Baja') basándote en el impacto potencial y la inminencia del evento.
  4.  Genera al menos una alerta, incluso para pronósticos leves (ej. "Condiciones óptimas, mantener monitoreo").

  **Datos para el Análisis:**
  -   **Pronóstico Climático**: {{{weatherForecast}}}
  -   **Estado Fenológico Reciente**: {{{phenologyLogs}}}

  Genera únicamente la salida JSON con el arreglo de alertas.
  `,
});

const generateWeatherAlertsFlow = ai.defineFlow(
  {
    name: 'generateWeatherAlertsFlow',
    inputSchema: GenerateWeatherAlertsInputSchema,
    outputSchema: GenerateWeatherAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
