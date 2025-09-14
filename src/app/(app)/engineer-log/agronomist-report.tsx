
'use client';

import React, { useContext, useTransition, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/app-data-context';
import { summarizeAgronomistReport } from '@/ai/flows/summarize-agronomist-report';
import { useToast } from '@/hooks/use-toast';
import { AgroVisionLogo } from '@/components/icons';
import type { AgronomistLog, PhenologyLog } from '@/lib/types';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: { finalY: number };
}

export function AgronomistReport() {
  const [isPending, startTransition] = useTransition();
  const { agronomistLogs, phenologyLogs, currentUser, establishmentData } = useContext(AppDataContext);
  const { toast } = useToast();

  if (!currentUser) return null; // Guard clause
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  const logoRef = useRef<HTMLDivElement>(null);

  const handleGeneratePdf = () => {
    startTransition(async () => {
      if (!establishmentData) {
        toast({
            title: 'Datos no disponibles',
            description: 'No se pueden cargar los datos del establecimiento para generar el informe.',
            variant: 'destructive',
        });
        return;
      }
      if (agronomistLogs.length === 0 && phenologyLogs.length === 0) {
        toast({
            title: 'No hay datos',
            description: 'No se puede generar un informe sin registros en las bitácoras.',
            variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Generando Informe Técnico',
        description: 'Por favor espere, estamos compilando las bitácoras y el análisis de IA...',
      });

      try {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4'}) as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        let logoPngDataUri = '';

        if (logoRef.current) {
            const canvas = await html2canvas(logoRef.current, {backgroundColor: null, scale: 3});
            logoPngDataUri = canvas.toDataURL('image/png');
        }
        
        let yPos = 40;
        const addPageFooter = (docInstance: jsPDF) => {
            const pageCount = docInstance.internal.getNumberOfPages();
            docInstance.setFont('helvetica', 'normal');
            docInstance.setFontSize(9);
            docInstance.setTextColor(150);
            for(let i = 1; i <= pageCount; i++) {
                docInstance.setPage(i);
                docInstance.text(`Página ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right'});
                docInstance.text(`Informe Técnico Agronómico - AgroVision`, 15, pageHeight - 10);
            }
        };
        
        const addPageHeader = (docInstance: jsPDF) => {
            if (logoPngDataUri) {
              docInstance.addImage(logoPngDataUri, 'PNG', 15, 12, 18, 18);
            }
            docInstance.setFont('helvetica', 'bold');
            docInstance.setFontSize(16);
            docInstance.setTextColor(40);
            docInstance.text("Informe Técnico Agronómico", pageWidth / 2, 22, { align: 'center' });
            docInstance.setDrawColor(180);
            docInstance.line(15, 30, pageWidth - 15, 30);
        };
        
        const checkAndAddPage = (neededHeight = 0) => {
            if (yPos + neededHeight > pageHeight - 25) {
                doc.addPage();
                addPageHeader(doc);
                yPos = 40;
            }
        };

        const addSection = (title: string, content: string) => {
            checkAndAddPage(20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text(title, 15, yPos);
            yPos += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(80);
            
            const splitContent = doc.splitTextToSize(content, pageWidth - 30);
            splitContent.forEach((line: string) => {
                checkAndAddPage(5);
                doc.text(line, 15, yPos, { align: 'justify' });
                yPos += 5;
            });
            yPos += 10;
        };

        const addTable = (title: string, head: any, body: any) => {
            checkAndAddPage(20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text(title, 15, yPos);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(80);

            doc.autoTable({
                head,
                body,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [38, 70, 83], textColor: 255, font: 'helvetica', fontStyle: 'bold' },
                bodyStyles: { textColor: 80, font: 'helvetica', fontSize: 8, minCellHeight: 15 },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    2: { cellWidth: 'auto' }
                },
                didDrawCell: (data) => {
                    const imgColIndex = head[0].length - 1;
                    if (data.column.index === imgColIndex && data.row.section === 'body') {
                      const cellValue = body[data.row.index][imgColIndex];
                      if (cellValue && cellValue !== 'No') {
                          // Clear cell text
                          data.cell.text = '';
                          const imgUrl = cellValue;
                          try {
                              const imgX = data.cell.x + 2;
                              const imgY = data.cell.y + 2;
                              const imgWidth = 10;
                              const imgHeight = 10;
                              doc.addImage(imgUrl, 'JPEG', imgX, imgY, imgWidth, imgHeight);
                              doc.link(imgX, imgY, imgWidth, imgHeight, { url: imgUrl });
                          } catch (e) {
                              console.error("Error adding image to PDF table", e);
                              // If image fails, add a clickable link text instead
                              doc.setTextColor(42, 157, 244); // blue color for link
                              doc.textWithLink('Link', data.cell.x + 2, data.cell.y + 8, { url: imgUrl });
                              doc.setTextColor(80); // reset color
                          }
                      }
                    }
                },
                rowPageBreak: 'auto',
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // --- Get AI Content ---
        const aiInput = {
            agronomistLogs: JSON.stringify(agronomistLogs.slice(0, 20).map(l => ({date: l.date, type: l.type, product: l.product, notes: l.notes}))),
            phenologyLogs: JSON.stringify(phenologyLogs.slice(0, 20).map(l => ({date: l.date, state: l.developmentState, notes: l.notes}))),
        };
        const aiResult = await summarizeAgronomistReport(aiInput);

        // --- PDF GENERATION ---
        
        // --- COVER PAGE ---
        if (logoPngDataUri) {
          doc.addImage(logoPngDataUri, 'PNG', pageWidth / 2 - 20, pageHeight / 3 - 10, 40, 40);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(40);
        doc.text('Informe Técnico Agronómico', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Fecha del Informe: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
        doc.text(establishmentData.producer, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });
        doc.text(`Responsable Técnico: ${establishmentData.technicalManager}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

        // --- REPORT CONTENT ---
        doc.addPage();
        addPageHeader(doc);
        
        addSection("Análisis Técnico (IA)", aiResult.technicalAnalysis);
        addSection("Conclusiones y Recomendaciones (IA)", aiResult.conclusionsAndRecommendations);

        const sortedAgronomistLogs = [...agronomistLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        addTable("Bitácora de Actividades",
            [['Fecha', 'Tipo', 'Producto/Detalle', 'Notas', 'Imagen']],
            sortedAgronomistLogs.map((log: AgronomistLog) => [
                new Date(log.date).toLocaleDateString('es-ES'),
                log.type,
                log.product || '-',
                log.notes,
                log.images && log.images.length > 0 ? log.images[0].url : 'No',
            ])
        );
        
        checkAndAddPage();
        
        const sortedPhenologyLogs = [...phenologyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        addTable("Bitácora de Fenología",
            [['Fecha', 'Estado', 'Notas', 'Imagen']],
            sortedPhenologyLogs.map((log: PhenologyLog) => [
                new Date(log.date).toLocaleDateString('es-ES'),
                log.developmentState,
                log.notes,
                log.images && log.images.length > 0 ? log.images[0].url : 'No',
            ])
        );
        
        addPageFooter(doc);
        
        doc.save('Informe_Tecnico_Agronomico.pdf');
        
        toast({
            title: '¡Informe Generado!',
            description: 'El archivo PDF se ha descargado exitosamente.',
        });

      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: 'Error al Generar Informe',
          description: 'No se pudo generar el resumen con IA o compilar el PDF.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informe Técnico PDF</CardTitle>
          <CardDescription>Genere un informe técnico con todas las bitácoras y análisis de IA.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Este informe compilará todas las actividades agronómicas y de fenología registradas, ideal para el seguimiento y la toma de decisiones.
            </p>
            {/* Hidden elements for rendering and capturing */}
            <div style={{ position: 'fixed', opacity: 0, zIndex: -100, left: 0, top: 0, width: 'auto', height: 'auto' }} aria-hidden="true">
              <div ref={logoRef} style={{width: '64px', height: '64px'}}>
                 <AgroVisionLogo className="w-16 h-16"/>
              </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGeneratePdf} disabled={isPending || !canManage}>
            {isPending ? 'Generando PDF...' : 'Generar Informe Técnico'}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
