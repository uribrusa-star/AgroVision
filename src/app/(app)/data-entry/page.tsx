
'use client';
import { PageHeader } from "@/components/page-header";
import { ProductionForm } from "./production-form";
import { BatchHistory } from "../engineer-log/batch-history";
import { BatchLogForm } from "../engineer-log/batch-log-form";
import React from "react";
import { AppDataContext } from "@/context/app-data-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


export default function DataEntryPage() {
  const { currentUser } = React.useContext(AppDataContext);
  const canManageBatches = currentUser.role === 'Productor' || currentUser.role === 'Encargado';

  return (
    <>
      <PageHeader
        title="Entrada de Datos de Producción"
        description="Registre nuevos datos de producción, pago y gestione los lotes."
      />
      <div className="grid grid-cols-1 gap-8">
        <ProductionForm />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-4">
            <BatchHistory />
            {canManageBatches ? <BatchLogForm /> : <Card><CardHeader><CardTitle>Acceso Denegado</CardTitle><CardContent><p>No tiene permisos para pre-cargar lotes.</p></CardContent></CardHeader></Card>}
        </div>
      </div>

    </>
  );
}
