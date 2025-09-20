
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Gestión de Tareas"
        description="Cree, asigne y siga el progreso de las tareas del equipo."
      >
        <Button>Crear Nueva Tarea</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Pendiente */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Pendiente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aquí irán las tareas pendientes */}
            <p className="text-sm text-muted-foreground text-center py-8">No hay tareas pendientes.</p>
          </CardContent>
        </Card>

        {/* Columna En Progreso */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>En Progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aquí irán las tareas en progreso */}
            <p className="text-sm text-muted-foreground text-center py-8">No hay tareas en progreso.</p>
          </CardContent>
        </Card>

        {/* Columna Completado */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Completado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aquí irán las tareas completadas */}
            <p className="text-sm text-muted-foreground text-center py-8">No hay tareas completadas.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
