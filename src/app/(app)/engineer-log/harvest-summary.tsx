'use client';

import React, { useActionState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleSummarizeHarvest } from './actions';
import { AppDataContext } from '@/context/app-data-context';

const initialState = {
  summary: '',
  loading: false,
};

export function HarvestSummary() {
  const [state, formAction, isPending] = useActionState(handleSummarizeHarvest, initialState);
  const { harvests, currentUser } = useContext(AppDataContext);
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Resumen de Cosecha con IA</CardTitle>
          <CardDescription>Genere un resumen completo de todos los datos de cosecha utilizando IA para identificar tendencias y perspectivas.</CardDescription>
        </CardHeader>
        <input type="hidden" name="harvests" value={JSON.stringify(harvests)} />
        {state.summary && (
          <CardContent>
            <Alert>
              <AlertTitle>Resumen Generado</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{state.summary}</AlertDescription>
            </Alert>
          </CardContent>
        )}
        <CardFooter>
          <Button type="submit" disabled={isPending || !canManage}>
            {isPending ? 'Generando...' : 'Generar Resumen'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
