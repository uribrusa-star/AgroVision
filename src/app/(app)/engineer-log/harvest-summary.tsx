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
  lastAutoTable: { finalY: number };
}

export function HarvestSummary() {
  const [isPending, startTransition] = useTransition();
  const { harvests, collectorPaymentLogs, agronomistLogs, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  const addPageHeader = (doc: jsPDFWithAutoTable) => {
    const logoSvg = document.getElementById('ag-logo-svg');
    if (logoSvg) {
        const svgData = new XMLSerializer().serializeToString(logoSvg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        // This is a simplified way to draw the SVG path. A more robust solution might convert the SVG to an image first.
        doc.addImage(img, 'SVG', 14, 15, 30, 30);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("AgroVision", 50, 35);
  }

  const addPageFooter = (doc: jsPDFWithAutoTable) => {
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right'});
        doc.text(`Fecha del Informe: ${new Date().toLocaleDateString('es-ES')}`, 14, doc.internal.pageSize.height - 10);
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
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        // --- COVER PAGE ---
        const logoSvg = document.getElementById('ag-logo-svg');
        if (logoSvg) {
            const svgData = new XMLSerializer().serializeToString(logoSvg);
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            doc.addImage(img, 'SVG', pageWidth / 2 - 40, pageHeight / 3 - 50, 80, 80);
        }
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Informe de Producción', pageWidth / 2, pageHeight / 2, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Rendimiento y Desarrollo del Sistema Productivo', pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, pageHeight / 2 + 60, { align: 'center' });


        // 1. Get AI Summary
        const harvestDataString = JSON.stringify(harvests, null, 2);
        const result = await summarizeHarvestData({ harvestData: harvestDataString });
        let summary = result.summary;
        // Make titles bold in PDF
        summary = summary.replace(/\*\*(.*?)\*\*/g, '$1'); 


        // 2. Capture charts as images
        const yieldChartElement = document.getElementById('batch-yield-chart');
        const monthlyChartElement = document.getElementById('monthly-harvest-chart-container');
        
        let yieldChartImage, monthlyChartImage;

        if (yieldChartElement) {
          const canvas = await html2canvas(yieldChartElement, { backgroundColor: null, scale: 2});
          yieldChartImage = canvas.toDataURL('image/png', 1.0);
        }

        if (monthlyChartElement) {
          const canvas = await html2canvas(monthlyChartElement, { backgroundColor: null, scale: 2 });
          monthlyChartImage = canvas.toDataURL('image/png', 1.0);
        }

        // --- AI SUMMARY PAGE ---
        doc.addPage();
        addPageHeader(doc);
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text("Resumen Ejecutivo de IA", 40, 80);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');

        const splitSummary = doc.splitTextToSize(summary, pageWidth - 80);
        
        let yPos = 110;
        
        splitSummary.forEach((line: string) => {
            if (yPos > pageHeight - 60) {
              addPageFooter(doc);
              doc.addPage();
              addPageHeader(doc);
              yPos = 80;
            }

            const isTitle = ['Análisis General de Producción', 'Análisis de Rendimiento de Recolectores', 'Análisis de Tendencias Temporales', 'Recomendaciones Clave'].some(title => line.includes(title));

            if(isTitle) {
                doc.setFont('helvetica', 'bold');
                doc.text(line, 40, yPos);
                yPos += 5; // less space after bold title
            } else {
                doc.setFont('helvetica', 'normal');
                doc.text(line, 40, yPos);
            }
            yPos += 15;
        })


        // --- CHARTS PAGE ---
        if(yieldChartImage || monthlyChartImage) {
           doc.addPage();
           addPageHeader(doc);
           doc.setFontSize(18);
           doc.setTextColor(40);
           doc.setFont('helvetica', 'bold');
           doc.text("Análisis Gráfico", 40, 80);
           let chartYPos = 100;
           
           const chartWidth = pageWidth - 80;

            if (yieldChartImage) {
              const aspect = 300/600; // approximation of aspect ratio
              const chartHeight = chartWidth * aspect;
              doc.addImage(yieldChartImage, 'PNG', 40, chartYPos, chartWidth, chartHeight);
              chartYPos += chartHeight + 30;
            }

            if (monthlyChartImage) {
               if (chartYPos + 300 > pageHeight - 60) {
                  doc.addPage();
                  addPageHeader(doc);
                  chartYPos = 80;
               }
              const aspect = 300/600; // approximation of aspect ratio
              const chartHeight = chartWidth * aspect;
              doc.addImage(monthlyChartImage, 'PNG', 40, chartYPos, chartWidth, chartHeight);
              chartYPos += chartHeight + 30;
            }
        }
        
        // --- DATA TABLES PAGES ---
        const tableConfig = {
            headStyles: { fillColor: [38, 70, 83], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 100 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            footStyles: { fillColor: [230, 230, 230], textColor: 40, fontStyle: 'bold' },
            theme: 'grid',
            didDrawPage: (data: any) => {
              addPageHeader(doc);
            }
        };

        const addTableWithHeader = (title: string, head: any, body: any, startYOffset = 0) => {
            let startY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : 0) + 40 + startYOffset;
            
            if (startY > pageHeight - 100 || startYOffset > 0) { // check for space or force new page
                doc.addPage();
                startY = 80; // Start of content area
            }
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text(title, 40, startY - 15);
            doc.autoTable({ ...tableConfig, startY, head, body });
            yPos = doc.lastAutoTable.finalY;
        };
        
        if (harvests.length > 0) {
            addTableWithHeader('Registros de Cosecha', 
                [['Fecha', 'Lote', 'Recolector', 'Kilogramos']],
                harvests.map((h: Harvest) => [
                    new Date(h.date).toLocaleDateString('es-ES'),
                    h.batchNumber,
                    h.collector.name,
                    h.kilograms.toLocaleString('es-ES')
                ]),
                1
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
