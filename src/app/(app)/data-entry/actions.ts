'use server';

import { z } from 'zod';
import { validateProductionData } from '@/ai/flows/validate-production-data';
import { collectors, harvests } from '@/lib/data';

const ProductionSchema = z.object({
  batchId: z.string().min(1, 'El ID del lote es requerido'),
  kilosPerBatch: z.coerce.number().min(0.1, 'Los kilos deben ser un número positivo'),
  farmerId: z.string().min(1, 'El agricultor es requerido'),
});

type State = {
  message: string;
  success: boolean;
};

export async function handleProductionUpload(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = ProductionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Datos de formulario no válidos. Por favor, revise sus entradas.',
      success: false,
    };
  }

  const { batchId, kilosPerBatch, farmerId } = validatedFields.data;
  
  const farmer = collectors.find(c => c.id === farmerId);
  if (!farmer) {
    return { message: 'Agricultor no encontrado.', success: false };
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
        message: `Falló la validación de IA: ${validationResult.reason}`,
        success: false,
      };
    }

    // Aquí normalmente guardarías los datos en tu base de datos
    console.log('Datos validados y guardados:', validatedFields.data);
    // También agregarías la nueva cosecha a la matriz/base de datos `harvests` aquí.

    return {
      message: `Lote ${batchId} con ${kilosPerBatch}kg cargado y validado exitosamente.`,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Ocurrió un error inesperado durante la validación de IA.',
      success: false,
    };
  }
}
