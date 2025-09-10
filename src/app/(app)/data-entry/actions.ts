
'use server';

import { z } from 'zod';
import type { Collector, Harvest, CollectorPaymentLog } from '@/lib/types';

const ProductionSchema = z.object({
  batchId: z.string().min(1, 'El ID del lote es requerido.'),
  kilosPerBatch: z.coerce.number().min(0.1, 'Los kilos deben ser un número positivo'),
  farmerId: z.string().min(1, 'El recolector es requerido.'),
  ratePerKg: z.coerce.number().min(0.01, "La tarifa por kg es requerida."),
  collectors: z.string().min(1, 'La lista de recolectores es requerida'),
});

type State = {
  message: string;
  success: boolean;
  newHarvest?: Harvest;
  newPaymentLog?: CollectorPaymentLog;
};

export async function handleProductionUpload(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = ProductionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).join(', ');
    return {
      message: `Datos de formulario no válidos: ${errorMessages}`,
      success: false,
    };
  }

  const { batchId, kilosPerBatch, farmerId, ratePerKg, collectors: collectorsString } = validatedFields.data;
  
  const collectors: Collector[] = JSON.parse(collectorsString);
  const farmer = collectors.find(c => c.id === farmerId);

  if (!farmer) {
    return { message: 'Recolector no encontrado.', success: false };
  }

  try {
    const newHarvest: Harvest = {
        id: `H${Date.now()}`,
        date: new Date().toISOString(),
        batchNumber: batchId,
        kilograms: kilosPerBatch,
        collector: {
            id: farmerId,
            name: farmer.name,
        }
    };
    
    const calculatedPayment = kilosPerBatch * ratePerKg;
    // For simplicity, we assume fixed hours per harvest entry
    const hoursWorked = 4;

    const newPaymentLog: CollectorPaymentLog = {
      id: `PAY${Date.now()}`,
      harvestId: newHarvest.id,
      date: new Date().toISOString(),
      collectorId: farmerId,
      collectorName: farmer.name,
      kilograms: kilosPerBatch,
      hours: hoursWorked,
      ratePerKg: ratePerKg,
      payment: calculatedPayment,
    }
    
    return {
      message: `Lote ${batchId} con ${kilosPerBatch}kg cargado. Pago de $${calculatedPayment.toFixed(2)} registrado para ${farmer.name}.`,
      success: true,
      newHarvest,
      newPaymentLog,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Ocurrió un error inesperado.',
      success: false,
    };
  }
}
