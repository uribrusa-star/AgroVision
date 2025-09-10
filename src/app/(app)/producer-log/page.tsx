
'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { TransactionForm } from './transaction-form';
import { NotesForm } from './notes-form';
import { TransactionHistory } from './transaction-history';
import { NotesHistory } from './notes-history';
import { HarvestSummary } from './harvest-summary';


export default function ProducerLogPage() {
  
  return (
    <>
      <PageHeader
        title="Bitácora del Productor"
        description="Registre las finanzas y las observaciones diarias del establecimiento."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TransactionForm />
          <TransactionHistory />
        </div>
        <div className="space-y-8">
          <NotesForm />
          <NotesHistory />
        </div>
        <div className="lg:col-span-2">
            <HarvestSummary />
        </div>
      </div>
    </>
  );
}
