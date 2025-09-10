'use client';
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Droplet, MapPin, Milestone, Mountain, Sprout, Wind, TrendingUp, Sun, Ruler, CheckCircle, Pencil } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { AppDataContext } from "@/context/app-data-context";
import type { EstablishmentData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type FormSchemaType = z.infer<typeof soilSchema> | z.infer<typeof plantingSchema> | z.infer<typeof irrigationSchema> | z.infer<typeof managementSchema>;

const soilSchema = z.object({
  type: z.string().min(1, "El tipo de suelo es requerido."),
  analysis: z.boolean(),
  mulching: z.string().min(1, "El tipo de cobertura es requerido."),
});

const plantingSchema = z.object({
  variety: z.string().min(1, "Las variedades son requeridas."),
  date: z.string().min(1, "La fecha de plantación es requerida."),
  origin: z.string().min(1, "El origen es requerido."),
  density: z.string().min(1, "La densidad es requerida."),
});

const irrigationSchema = z.object({
  system: z.string().min(1, "El sistema de riego es requerido."),
  flowRate: z.string().min(1, "El caudal es requerido."),
  frequency: z.string().min(1, "La frecuencia es requerida."),
  waterAnalysis: z.boolean(),
});

const managementSchema = z.object({
    weeds: z.string().min(1, "El control de malezas es requerido."),
    sanitaryPlan: z.string().min(1, "El plan sanitario es requerido."),
    period: z.string().min(1, "El período de cosecha es requerido."),
    frequency: z.string().min(1, "La frecuencia de cosecha es requerida."),
});


const InfoCard = ({ title, icon: Icon, children, onEdit }: { title: string, icon: React.ElementType, children: React.ReactNode, onEdit?: () => void }) => {
  const { currentUser } = useContext(AppDataContext);
  const canEdit = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-6 w-6">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Icon className="h-6 w-6 text-primary" />
            </div>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
  )
};

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-dashed">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-sm text-right font-semibold">{value}</div>
    </div>
);

const EditDialog = ({ open, onOpenChange, title, schema, defaultValues, onSubmit, children }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, schema: any, defaultValues: any, onSubmit: (values: any) => void, children: React.ReactNode }) => {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar {title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {children(form)}
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                            <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};


export default function EstablishmentPage() {
  const { loading, establishmentData, updateEstablishmentData } = useContext(AppDataContext);
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleEdit = (section: string) => {
    setEditingSection(section);
  }

  const handleCloseDialog = () => {
    setEditingSection(null);
  }

  const handleSubmit = async (section: keyof EstablishmentData, values: any) => {
      if (!establishmentData) return;
      
      let updatedData = {};
      if (section === 'soil' || section === 'planting' || section === 'irrigation' || section === 'management' || section === 'harvest' ) {
          if(section === 'soil'){
            updatedData = { soil: { type: values.type, analysis: values.analysis }, planting: {...establishmentData.planting, mulching: values.mulching} };
          } else {
            updatedData = { [section]: values };
          }
      }

      try {
        await updateEstablishmentData(updatedData);
        toast({ title: "¡Éxito!", description: "Los datos del establecimiento han sido actualizados."});
        handleCloseDialog();
      } catch (error) {
        toast({ title: "Error", description: "No se pudo actualizar los datos.", variant: "destructive"});
      }
  };


  if (loading || !establishmentData) {
    return (
        <>
            <PageHeader
                title="Perfil del Establecimiento"
                description="Información detallada sobre la finca, el cultivo y las prácticas de manejo."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
                <div className="space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
                <div className="space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
            </div>
        </>
    );
  }

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
             <InfoCard title="Suelo y Cobertura" icon={Mountain} onEdit={() => handleEdit('soil')}>
               <InfoItem label="Tipo de Suelo" value={establishmentData.soil.type} />
               <InfoItem label="Análisis Inicial" value={establishmentData.soil.analysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : 'No'} />
               <InfoItem label="Cobertura (Mulching)" value={establishmentData.planting.mulching} />
            </InfoCard>
        </div>

        {/* Columna 2 */}
        <div className="space-y-6">
            <InfoCard title="Implantación del Cultivo" icon={Sprout} onEdit={() => handleEdit('planting')}>
                <InfoItem label="Variedades" value={establishmentData.planting.variety} />
                <InfoItem label="Fecha de Plantación" value={new Date(establishmentData.planting.date).toLocaleDateString('es-ES')} />
                <InfoItem label="Origen de Plantas" value={establishmentData.planting.origin} />
                <InfoItem label="Densidad" value={establishmentData.planting.density} />
            </InfoCard>

            <InfoCard title="Riego y Fertirrigación" icon={Droplet} onEdit={() => handleEdit('irrigation')}>
                <InfoItem label="Sistema de Riego" value={establishmentData.irrigation.system} />
                <InfoItem label="Caudal por Gotero" value={establishmentData.irrigation.flowRate} />
                <InfoItem label="Frecuencia Base" value={establishmentData.irrigation.frequency} />
                <InfoItem label="Análisis de Agua" value={establishmentData.irrigation.waterAnalysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : 'No'} />
            </InfoCard>
        </div>

        {/* Columna 3 */}
        <div className="space-y-6">
            <InfoCard title="Manejo y Cosecha" icon={Wind} onEdit={() => handleEdit('management')}>
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

       {/* Edit Modals */}
      <EditDialog
          open={editingSection === 'soil'}
          onOpenChange={handleCloseDialog}
          title="Suelo y Cobertura"
          schema={soilSchema}
          defaultValues={{ type: establishmentData.soil.type, analysis: establishmentData.soil.analysis, mulching: establishmentData.planting.mulching }}
          onSubmit={(values) => handleSubmit('soil', values)}
      >
          {(form: any) => (
              <>
                  <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Tipo de Suelo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="mulching" render={({ field }) => ( <FormItem> <FormLabel>Cobertura (Mulching)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="analysis" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <div className="space-y-1 leading-none"><FormLabel>¿Se realizó análisis de suelo inicial?</FormLabel></div> </FormItem> )} />
              </>
          )}
      </EditDialog>
      
       <EditDialog
          open={editingSection === 'planting'}
          onOpenChange={handleCloseDialog}
          title="Implantación del Cultivo"
          schema={plantingSchema}
          defaultValues={{ ...establishmentData.planting }}
          onSubmit={(values) => handleSubmit('planting', values)}
      >
          {(form: any) => (
              <>
                  <FormField control={form.control} name="variety" render={({ field }) => ( <FormItem> <FormLabel>Variedades</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="date" render={({ field }) => ( <FormItem> <FormLabel>Fecha de Plantación</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="origin" render={({ field }) => ( <FormItem> <FormLabel>Origen de Plantas</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="density" render={({ field }) => ( <FormItem> <FormLabel>Densidad</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </>
          )}
      </EditDialog>

        <EditDialog
          open={editingSection === 'irrigation'}
          onOpenChange={handleCloseDialog}
          title="Riego y Fertirrigación"
          schema={irrigationSchema}
          defaultValues={{ ...establishmentData.irrigation }}
          onSubmit={(values) => handleSubmit('irrigation', values)}
        >
          {(form: any) => (
              <>
                  <FormField control={form.control} name="system" render={({ field }) => ( <FormItem> <FormLabel>Sistema de Riego</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="flowRate" render={({ field }) => ( <FormItem> <FormLabel>Caudal por Gotero</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem> <FormLabel>Frecuencia Base</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="waterAnalysis" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <div className="space-y-1 leading-none"><FormLabel>¿Se realizó análisis de agua?</FormLabel></div> </FormItem> )} />
              </>
          )}
      </EditDialog>
      
        <EditDialog
          open={editingSection === 'management'}
          onOpenChange={handleCloseDialog}
          title="Manejo y Cosecha"
          schema={managementSchema}
          defaultValues={{ weeds: establishmentData.management.weeds, sanitaryPlan: establishmentData.management.sanitaryPlan, period: establishmentData.harvest.period, frequency: establishmentData.harvest.frequency }}
          onSubmit={(values) => handleSubmit('management', { management: { weeds: values.weeds, sanitaryPlan: values.sanitaryPlan }, harvest: { ...establishmentData.harvest, period: values.period, frequency: values.frequency } })}
      >
          {(form: any) => (
              <>
                  <FormField control={form.control} name="weeds" render={({ field }) => ( <FormItem> <FormLabel>Control de Malezas</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="sanitaryPlan" render={({ field }) => ( <FormItem> <FormLabel>Plan Sanitario</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="period" render={({ field }) => ( <FormItem> <FormLabel>Período de Cosecha</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem> <FormLabel>Frecuencia de Cosecha</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </>
          )}
      </EditDialog>
    </>
  );
}
