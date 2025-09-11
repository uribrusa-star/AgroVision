
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { YieldPredictionPanel } from './yield-prediction-panel';
import { AlertCircle, LineChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PredictionsPage() {
  return (
    <>
      <PageHeader
        title="Predicciones de Rendimiento"
        description="Utilice la IA para proyectar el rendimiento de sus lotes en la próxima semana."
      />

      <Alert className="mb-8 border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Funcionalidad Experimental</AlertTitle>
        <AlertDescription>
          Las predicciones se basan en los datos disponibles y un análisis de IA. Tómelas como una guía y no como una garantía de resultados.
        </AlertDescription>
      </Alert>

      <div className="w-full max-w-4xl mx-auto">
        <YieldPredictionPanel />
      </div>
    </>
  );
}
