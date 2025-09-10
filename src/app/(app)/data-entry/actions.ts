'use server';

import { z } from 'zod';
import { validateProductionData } from '@/ai/flows/validate-production-data';
import { collectors, harvests } from '@/lib/data';

const ProductionSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  kilosPerBatch: z.coerce.number().min(0.1, 'Kilos must be a positive number'),
  farmerId: z.string().min(1, 'Farmer is required'),
});

type State = {
  message: string;
  success: boolean;
};

export async function handleProductionUpload(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = ProductionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    };
  }

  const { batchId, kilosPerBatch, farmerId } = validatedFields.data;
  
  const farmer = collectors.find(c => c.id === farmerId);
  if (!farmer) {
    return { message: 'Farmer not found.', success: false };
  }

  const farmerHarvests = harvests.filter(h => h.collector.id === farmerId);
  const historicalData = JSON.stringify(farmerHarvests);
  const totalKilos = farmerHarvests.reduce((sum, h) => sum + h.kilograms, 0);
  const averageKilosPerBatch = farmerHarvests.length > 0 ? totalKilos / farmerHarvests.length : 0;


  try {
    const validationResult = await validateProductionData({
      batchId,
      kilosPerBatch,
      farmerId,
      timestamp: new Date().toISOString(),
      averageKilosPerBatch,
      historicalData,
    });

    if (!validationResult.isValid) {
      return {
        message: `AI Validation Failed: ${validationResult.reason}`,
        success: false,
      };
    }

    // Here you would typically save the data to your database
    console.log('Data validated and saved:', validatedFields.data);
    // You would also add the new harvest to the `harvests` array/database here.

    return {
      message: `Batch ${batchId} with ${kilosPerBatch}kg successfully uploaded and validated.`,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred during AI validation.',
      success: false,
    };
  }
}
