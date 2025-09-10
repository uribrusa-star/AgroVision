'use client';

import React, { useContext, useTransition } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/app-data-context';
import { summarizeHarvestData } from '@/ai/flows/summarize-harvest-data';
import { useToast } from '@/hooks/use-toast';
import type { AgronomistLog, CollectorPaymentLog, Harvest } from '@/lib/types';
import { AgroVisionLogo } from '@/components/icons';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export function HarvestSummary() {
  const [isPending, startTransition] = useTransition();
  const { harvests, collectorPaymentLogs, agronomistLogs, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  const addPageHeader = (doc: jsPDFWithAutoTable) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(150);
      
      const logoSvg = document.getElementById('ag-logo-svg');
      if (logoSvg) {
        // This is a simplified way to draw the SVG path. A more robust solution might convert the SVG to an image first.
        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        // A simple representation of the logo - this would ideally be an image
        doc.text("AgroVision", 14, 15)
      } else {
        doc.text("AgroVision", 14, 15);
      }

      doc.text(`Informe de Producción`, doc.internal.pageSize.width / 2, 15, { align: 'center'});
  }

  const addPageFooter = (doc: jsPDFWithAutoTable) => {
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right'});
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, doc.internal.pageSize.height - 10);
    }
  }


  const handleGeneratePdf = async () => {
    startTransition(async () => {
      toast({
        title: 'Generando Informe',
        description: 'Por favor espere, estamos compilando los datos y el análisis de IA...',
      });

      try {
        const doc = new jsPDF('p', 'pt', 'a4') as jsPDFWithAutoTable;
        let yPos = 80;

        // 1. Get AI Summary
        const harvestDataString = JSON.stringify(harvests, null, 2);
        const result = await summarizeHarvestData({ harvestData: harvestDataString });
        const summary = result.summary;

        // 2. Capture charts as images
        const yieldChartElement = document.getElementById('batch-yield-chart-pdf');
        const monthlyChartElement = document.getElementById('monthly-harvest-chart-pdf');
        
        let yieldChartImage, monthlyChartImage;

        if (yieldChartElement) {
          const canvas = await html2canvas(yieldChartElement, { backgroundColor: null });
          yieldChartImage = canvas.toDataURL('image/png');
        }

        if (monthlyChartElement) {
          const canvas = await html2canvas(monthlyChartElement, { backgroundColor: null });
          monthlyChartImage = canvas.toDataURL('image/png');
        }

        // 3. Add Content to PDF
        addPageHeader(doc);
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("Resumen Ejecutivo de IA", 40, yPos);
        yPos += 20;
        doc.setFontSize(10);
        doc.setTextColor(100);
        const splitSummary = doc.splitTextToSize(summary, 500);
        doc.text(splitSummary, 40, yPos);
        yPos += splitSummary.length * 12 + 20;

        // Add charts if they were captured
        if(yieldChartImage || monthlyChartImage) {
           doc.addPage();
           yPos = 80;
           addPageHeader(doc);
           doc.setFontSize(14);
           doc.setTextColor(40);
           doc.text("Análisis Gráfico", 40, yPos);
           yPos += 20;
        }

        if (yieldChartImage) {
          doc.addImage(yieldChartImage, 'PNG', 40, yPos, 515, 250);
          yPos += 270;
        }

        if (monthlyChartImage) {
           if (yPos + 270 > doc.internal.pageSize.height) {
              doc.addPage();
              yPos = 80;
              addPageHeader(doc);
           }
           doc.addImage(monthlyChartImage, 'PNG', 40, yPos, 515, 250);
           yPos += 270;
        }

        const tableConfig = {
            headStyles: { fillColor: [38, 70, 83], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 100 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            footStyles: { fillColor: [230, 230, 230], textColor: 40, fontStyle: 'bold' },
            theme: 'grid',
            margin: { top: 80 } // To not overlap header
        };

        const addTableWithHeader = (title: string, head: any, body: any) => {
            const tableFinalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 0;
            let startY = Math.max(yPos, tableFinalY) + 40;
            
            if (startY > doc.internal.pageSize.height - 100) { // check for space
                doc.addPage();
                startY = 80; // Start of content area
                addPageHeader(doc);
            }
            
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text(title, 40, startY - 15);
            doc.autoTable({ ...tableConfig, startY, head, body });
            yPos = doc.lastAutoTable.finalY;
        };
        
        doc.addPage();
        yPos = 0; // Reset yPos for the new page
        addPageHeader(doc);

        if (harvests.length > 0) {
            addTableWithHeader('Registros de Cosecha', 
                [['Fecha', 'Lote', 'Recolector', 'Kilogramos']],
                harvests.map((h: Harvest) => [
                    new Date(h.date).toLocaleDateString('es-ES'),
                    h.batchNumber,
                    h.collector.name,
                    h.kilograms.toLocaleString('es-ES')
                ])
            );
        }
        
        if (agronomistLogs.length > 0) {
             addTableWithHeader('Bitácora del Agrónomo',
                [['Fecha', 'Tipo', 'Producto', 'Notas']],
                agronomistLogs.map((log: AgronomistLog) => [
                    new Date(log.date).toLocaleDateString('es-ES'),
                    log.type,
                    log.product || '-',
                    log.notes
                ])
             );
        }

        if (collectorPaymentLogs.length > 0) {
            addTableWithHeader('Pagos a Recolectores',
                [['Fecha', 'Recolector', 'Kg', 'Tarifa', 'Pago']],
                collectorPaymentLogs.map((log: CollectorPaymentLog) => [
                    new Date(log.date).toLocaleDateString('es-ES'),
                    log.collectorName,
                    log.kilograms.toLocaleString('es-ES'),
                    `$${log.ratePerKg.toFixed(2)}`,
                    `$${log.payment.toFixed(2)}`
                ])
            );
        }

        addPageFooter(doc);
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
          <div className="absolute -z-50 -left-[9999px] top-0" aria-hidden="true">
            <AgroVisionLogo id="ag-logo-svg" className="w-8 h-8"/>
          </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGeneratePdf} disabled={isPending || !canManage}>
          {isPending ? 'Generando PDF...' : 'Generar Informe PDF'}
        </Button>
      </CardFooter>
    </Card>
  )
}
