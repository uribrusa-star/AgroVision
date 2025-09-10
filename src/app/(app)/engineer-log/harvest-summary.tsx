'use client';

import React, { useContext, useTransition } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/app-data-context';
import { summarizeHarvestData } from '@/ai/flows/summarize-harvest-data';
import { useToast } from '@/hooks/use-toast';
import type { AgronomistLog, CollectorPaymentLog, Harvest } from '@/lib/types';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export function HarvestSummary() {
  const [isPending, startTransition] = useTransition();
  const { harvests, collectorPaymentLogs, agronomistLogs, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  const handleGeneratePdf = async () => {
    startTransition(async () => {
      toast({
        title: 'Generando Informe',
        description: 'Por favor espere, estamos compilando los datos y el análisis de IA...',
      });

      try {
        // 1. Get AI Summary
        const harvestDataString = JSON.stringify(harvests, null, 2);
        const result = await summarizeHarvestData({ harvestData: harvestDataString });
        const summary = result.summary;

        // 2. Initialize PDF
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // 3. Add Content to PDF
        doc.setFontSize(22);
        doc.text("Informe de Producción - AgroVision", 14, 20);
        doc.setFontSize(12);
        doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);
        
        doc.setFontSize(16);
        doc.text("Resumen de IA", 14, 40);
        doc.setFontSize(11);
        const splitSummary = doc.splitTextToSize(summary, 180);
        doc.text(splitSummary, 14, 48);

        let yPos = doc.lastAutoTable.finalY || 70;
        if (yPos < 70) yPos = 70;


        // Harvests Table
        if (harvests.length > 0) {
            doc.autoTable({
                startY: yPos + 10,
                head: [['Fecha', 'Lote', 'Recolector', 'Kilogramos']],
                body: harvests.map((h: Harvest) => [
                    new Date(h.date).toLocaleDateString('es-ES'),
                    h.batchNumber,
                    h.collector.name,
                    h.kilograms.toLocaleString('es-ES')
                ]),
                headStyles: { fillColor: [38, 70, 83] },
                didDrawPage: (data) => { yPos = data.cursor?.y || yPos }
            });
        }
        
        // Agronomist Logs Table
        if (agronomistLogs.length > 0) {
             doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Fecha', 'Tipo', 'Producto', 'Notas']],
                body: agronomistLogs.map((log: AgronomistLog) => [
                    new Date(log.date).toLocaleDateString('es-ES'),
                    log.type,
                    log.product || '-',
                    log.notes
                ]),
                headStyles: { fillColor: [42, 157, 143] },
                didDrawPage: (data) => { yPos = data.cursor?.y || yPos }
            });
        }

        // Collector Payments Table
        if (collectorPaymentLogs.length > 0) {
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Fecha', 'Recolector', 'Kg', 'Tarifa', 'Pago']],
                body: collectorPaymentLogs.map((log: CollectorPaymentLog) => [
                    new Date(log.date).toLocaleDateString('es-ES'),
                    log.collectorName,
                    log.kilograms.toLocaleString('es-ES'),
                    `$${log.ratePerKg.toFixed(2)}`,
                    `$${log.payment.toFixed(2)}`
                ]),
                headStyles: { fillColor: [233, 196, 106] },
                didDrawPage: (data) => { yPos = data.cursor?.y || yPos }
            });
        }

        // 4. Save PDF
        doc.save('Informe_AgroVision.pdf');
        
        toast({
            title: '¡Informe Generado!',
            description: 'El archivo PDF se ha descargado exitosamente.',
        });

      } catch (error) {
        console.error(error);
        toast({
          title: 'Error al Generar Informe',
          description: 'No se pudo generar el resumen con IA o compilar el PDF.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informe de Cosecha en PDF</CardTitle>
        <CardDescription>Genere un informe completo en PDF con todos los datos de la temporada y un análisis generado por IA.</CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-muted-foreground">
              El informe incluirá un resumen de la cosecha, el historial de aplicaciones, los registros de cosecha y los pagos a los recolectores.
          </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGeneratePdf} disabled={isPending || !canManage}>
          {isPending ? 'Generando PDF...' : 'Generar Informe PDF'}
        </Button>
      </CardFooter>
    </Card>
  )
}
