
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { TransactionForm } from './transaction-form';
import { NotesForm } from './notes-form';
import { TransactionHistory } from './transaction-history';
import { NotesHistory } from './notes-history';
import { HarvestSummary } from './harvest-summary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { AppDataContext } from '@/context/app-data-context';
import { Skeleton } from '@/components/ui/skeleton';
import { CostDistributionChart } from '../dashboard/cost-distribution-chart';
import { IncomeChart } from './income-chart';


export default function ProducerLogPage() {
  const { loading, collectorPaymentLogs, packagingLogs, transactions } = React.useContext(AppDataContext);
  const totalHarvestLaborCost = collectorPaymentLogs.reduce((acc, p) => acc + p.payment, 0);
  const totalPackagingLaborCost = packagingLogs.reduce((acc, p) => acc + p.payment, 0);
  
  return (
    <>
      <PageHeader
        title="Bitácora del Productor"
        description="Registre las finanzas y las observaciones diarias del establecimiento."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda: Finanzas */}
        <div className="space-y-8">
          <TransactionForm />
          <IncomeChart transactions={transactions} />
          <CostDistributionChart />
          <TransactionHistory />
        </div>
        
        {/* Columna Derecha: Observaciones y Resúmenes */}
        <div className="space-y-8">
          <NotesForm />
          <NotesHistory />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo de Mano de Obra (Cosecha)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `$${totalHarvestLaborCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}</div>
              <p className="text-xs text-muted-foreground">Solo pagos a recolectores</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo de Mano de Obra (Embalaje)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `$${totalPackagingLaborCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}</div>
              <p className="text-xs text-muted-foreground">Solo pagos a embaladores</p>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Ancho Completo */}
        <div className="lg:col-span-2">
            <HarvestSummary />
        </div>
      </div>
    </>
  );
}
