
'use client';
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplet, MapPin, Milestone, Mountain, Sprout, Wind, TrendingUp, Sun, Ruler, CheckCircle } from 'lucide-react';
import React from "react";

const establishmentData = {
  producer: "Finca Las Fresas",
  technicalManager: "Ing. Agr. Juan Pérez",
  location: {
    coordinates: "-26.83, -65.22",
    locality: "Lules",
    province: "Tucumán"
  },
  area: {
    total: 10, // ha
    strawberry: 5 // ha
  },
  system: "Bajo túnel",
  planting: {
    variety: "Camino Real, San Andreas",
    date: "2024-04-15",
    origin: "Vivero certificado 'Génesis'",
    density: "60,000 plantas/ha",
    mulching: "Plástico negro"
  },
  soil: {
    type: "Franco arcilloso",
    analysis: true
  },
  irrigation: {
    system: "Goteo",
    flowRate: "1.2 L/h por gotero",
    frequency: "3 veces por semana",
    waterAnalysis: true
  },
  management: {
    weeds: "Manual y cobertura plástica",
    sanitaryPlan: "Monitoreo semanal de plagas y enfermedades",
  },
  harvest: {
    period: "Agosto a Diciembre",
    frequency: "2-3 veces por semana",
    destination: "Mercado fresco local y mayorista"
  },
  economics: {
    objective: "Maximizar rendimiento y calidad para mercado fresco."
  }
};


const InfoCard = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <Icon className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-dashed">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-right font-semibold">{value}</p>
    </div>
);

export default function EstablishmentPage() {
  return (
    <>
      <PageHeader
        title="Perfil del Establecimiento"
        description="Información detallada sobre la finca, el cultivo y las prácticas de manejo."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 */}
        <div className="space-y-6">
            <InfoCard title="Datos Generales" icon={MapPin}>
               <InfoItem label="Productor" value={establishmentData.producer} />
               <InfoItem label="Responsable Técnico" value={establishmentData.technicalManager} />
               <InfoItem label="Localidad" value={`${establishmentData.location.locality}, ${establishmentData.location.province}`} />
               <InfoItem label="Coordenadas" value={establishmentData.location.coordinates} />
            </InfoCard>

             <InfoCard title="Superficie" icon={Ruler}>
               <InfoItem label="Superficie Total" value={`${establishmentData.area.total} ha`} />
               <InfoItem label="Destinada a Frutilla" value={`${establishmentData.area.strawberry} ha`} />
               <InfoItem label="Sistema Productivo" value={establishmentData.system} />
            </InfoCard>
             <InfoCard title="Suelo y Cobertura" icon={Mountain}>
               <InfoItem label="Tipo de Suelo" value={establishmentData.soil.type} />
               <InfoItem label="Análisis Inicial" value={establishmentData.soil.analysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : 'No'} />
               <InfoItem label="Cobertura (Mulching)" value={establishmentData.planting.mulching} />
            </InfoCard>
        </div>

        {/* Columna 2 */}
        <div className="space-y-6">
            <InfoCard title="Implantación del Cultivo" icon={Sprout}>
                <InfoItem label="Variedades" value={establishmentData.planting.variety} />
                <InfoItem label="Fecha de Plantación" value={new Date(establishmentData.planting.date).toLocaleDateString('es-ES')} />
                <InfoItem label="Origen de Plantas" value={establishmentData.planting.origin} />
                <InfoItem label="Densidad" value={establishmentData.planting.density} />
            </InfoCard>

            <InfoCard title="Riego y Fertirrigación" icon={Droplet}>
                <InfoItem label="Sistema de Riego" value={establishmentData.irrigation.system} />
                <InfoItem label="Caudal por Gotero" value={establishmentData.irrigation.flowRate} />
                <InfoItem label="Frecuencia Base" value={establishmentData.irrigation.frequency} />
                <InfoItem label="Análisis de Agua" value={establishmentData.irrigation.waterAnalysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : 'No'} />
            </InfoCard>
        </div>

        {/* Columna 3 */}
        <div className="space-y-6">
            <InfoCard title="Manejo y Cosecha" icon={Wind}>
                <InfoItem label="Control de Malezas" value={establishmentData.management.weeds} />
                <InfoItem label="Plan Sanitario" value={establishmentData.management.sanitaryPlan} />
                <InfoItem label="Período de Cosecha" value={establishmentData.harvest.period} />
                <InfoItem label="Frecuencia" value={establishmentData.harvest.frequency} />
            </InfoCard>

            <InfoCard title="Comercialización" icon={TrendingUp}>
                 <InfoItem label="Destino Principal" value={establishmentData.harvest.destination} />
                 <InfoItem label="Objetivo Económico" value={establishmentData.economics.objective} />
            </InfoCard>
        </div>

      </div>
    </>
  );
}
