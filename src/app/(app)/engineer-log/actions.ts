'use server';

import { summarizeHarvestData } from '@/ai/flows/summarize-harvest-data';
import type { Harvest } from '@/lib/types';


type State = {
  summary: string;
  loading: boolean;
};

export async function handleSummarizeHarvest(prevState: State, formData: FormData): Promise<State> {
  // Indicate loading state
  // In a real app, you would revalidate a path or redirect, but here we return state.
  // A re-render will be triggered on the client.
  // We cannot stream UI from a server action like this without more complex patterns.
  // So we return the final state.
  
  // This is a placeholder to show loading state. In a real app, you might use optimistic UI.
  // For this simple example, we'll just toggle loading, but it will be very fast.
  const harvests: Harvest[] = JSON.parse(formData.get('harvests') as string || '[]');

  try {
    const harvestDataString = JSON.stringify(harvests, null, 2);
    const result = await summarizeHarvestData({ harvestData: harvestDataString });
    return { summary: result.summary, loading: false };
  } catch (error) {
    console.error(error);
    return { summary: 'No se pudo generar el resumen.', loading: false };
  }
}
