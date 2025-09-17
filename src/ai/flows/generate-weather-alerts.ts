'use server';

/**
 * @fileOverview Generates agronomic alerts based on weather forecasts for a given location.
 *
 * - generateWeatherAlerts - A function that calls the alert generation flow.
 * - GenerateWeatherAlertsInput - The input type for the function.
 * - GenerateWeatherAlertsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeatherForecast } from '@/ai/tools/weather-tool';

const GenerateWeatherAlertsInputSchema = z.object({
  latitude: z.number().describe('La latitud para la cual obtener el pronóstico del tiempo.'),
  longitude: z.number().describe('La longitud para la cual obtener el pronóstico del tiempo.'),
  phenologyLogs: z.string().describe('JSON string con la bitácora de seguimiento fenológico reciente (floración, fructificación, etc.) para entender el estado actual del cultivo.'),
  agronomistLogs: z.string().describe('JSON string con el historial de actividades agronómicas recientes (fumigaciones, fertilización) para contexto adicional.'),
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
  tools: [getWeatherForecast],
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Eres un ingeniero agrónomo experto en el cultivo de frutillas, especializado en gestión de riesgos climáticos. Tu tarea es generar alertas y recomendaciones basadas en el pronóstico del tiempo para una ubicación específica para los próximos 7 días.

  **Instrucciones de Proceso Obligatorias:**

  1.  **Obtén el Pronóstico del Tiempo (Paso Obligatorio):**
      *   Debes invocar la herramienta \`getWeatherForecast\` utilizando la latitud ({{{latitude}}}) y longitud ({{{longitude}}}) proporcionadas para obtener el pronóstico del tiempo de los próximos 7 días. No puedes omitir este paso.

  2.  **Analiza en Silencio los Datos (Contexto Completo):**
      *   **Pronóstico Obtenido:** Revisa en detalle el pronóstico que te devolvió la herramienta. Presta especial atención a: temperaturas máximas y mínimas, probabilidad de precipitación (lluvia) y velocidad del viento.
      *   **Estado del Cultivo:** Analiza el estado fenológico reciente del cultivo a partir de estos datos: {{{phenologyLogs}}}. Identifica si está en floración, fructificación, maduración, etc.
      *   **Manejo Reciente:** Considera las últimas actividades agronómicas registradas para entender el contexto: {{{agronomistLogs}}}.

  3.  **Genera Alertas y Recomendaciones (Análisis y Conclusión):**
      *   Basándote en el **cruce de información** entre el pronóstico y el estado del cultivo, identifica los riesgos clave. Por ejemplo:
          *   Si el pronóstico indica "lluvia alta" y los registros de fenología muestran "fructificación" o "maduración", el riesgo de "Botrytis" es ALTO.
          *   Si el pronóstico indica "temperaturas > 30°C" y la fenología es "floración", el riesgo de "aborto floral por estrés térmico" es ALTO.
          *   Si el pronóstico indica "temperaturas < 2°C", el riesgo de "helada" es CRÍTICO en cualquier etapa.
      *   Para cada riesgo significativo, crea un objeto de alerta en español.
      *   **Riesgo:** Sé conciso y claro. Ej: "Riesgo de Botrytis por alta humedad y lluvias".
      *   **Recomendación:** Debe ser una acción concreta. Ej: "Asegurar ventilación máxima de los túneles y preparar aplicación preventiva de fungicida específico para Botrytis".
      *   **Urgencia:** Determina la urgencia ('Alta', 'Media', 'Baja') basándote en el impacto potencial y la inminencia del evento.
      *   **Respuesta Mínima:** Siempre debes generar al menos una alerta. Si el clima es ideal y no hay riesgos, genera una alerta de urgencia 'Baja' con un riesgo como "Condiciones óptimas de cultivo" y una recomendación como "Mantener monitoreo regular y continuar con el plan de manejo actual".

  Genera únicamente la salida JSON con el arreglo de alertas. No incluyas ningún texto introductorio o explicaciones adicionales fuera del formato JSON.
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
