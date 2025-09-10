'use client';

import React, { useActionState, useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { DollarSign, HardHat, Sprout, Tractor, Weight, Image as ImageIcon, MoreHorizontal, PackageCheck, Package, CalendarClock, Trash2 } from 'lucide-react';
import { engineerLogStats } from '@/lib/data';
import { handleSummarizeHarvest } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppDataContext } from '@/context/app-data-context';
import { ApplicationLogForm } from './application-log-form';
import type { AgronomistLog, Batch, Harvest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchLogForm } from './batch-log-form';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


const initialState = {
  summary: '',
  loading: false,
};

const LogSchema = z.object({
  type: z.enum(['Fertilización', 'Fumigación', 'Control'], {
    required_error: "El tipo de aplicación es requerido.",
  }),
  product: z.string().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
});

type LogFormValues = z.infer<typeof LogSchema>;

function HarvestSummary() {
  const [state, formAction] = useActionState(handleSummarizeHarvest, initialState);
  const [showSummary, setShowSummary] = useState(false);
  const { harvests } = useContext(AppDataContext);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSummary(true);
    const formData = new FormData();
    formData.set('harvests', JSON.stringify(harvests));
    formAction(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Resumen de Cosecha con IA</CardTitle>
          <CardDescription>Genere un resumen completo de todos los datos de cosecha utilizando IA para identificar tendencias y perspectivas.</CardDescription>
        </CardHeader>
        {showSummary && (
          <CardContent>
            {state.loading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[75%]" />
              </div>
            )}
            {state.summary && (
              <Alert>
                <AlertTitle>Resumen Generado</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{state.summary}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
        <CardFooter>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? 'Generando...' : 'Generar Resumen'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function ApplicationHistory() {
  const { agronomistLogs, editAgronomistLog, deleteAgronomistLog } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AgronomistLog | null>(null);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (selectedLog) {
      form.reset({
        type: selectedLog.type,
        product: selectedLog.product,
        notes: selectedLog.notes,
      });
    }
  }, [selectedLog, form]);

  const handleEdit = (log: AgronomistLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (logId: string) => {
    deleteAgronomistLog(logId);
    toast({
      title: "Registro Eliminado",
      description: "La entrada del registro ha sido eliminada exitosamente.",
    });
  };

  const onEditSubmit = (values: LogFormValues) => {
    if (selectedLog) {
      editAgronomistLog({
        ...selectedLog,
        type: values.type,
        product: values.product,
        notes: values.notes,
      });
      setIsEditDialogOpen(false);
      setSelectedLog(null);
      toast({
        title: "Registro Actualizado",
        description: "La entrada del registro ha sido actualizada exitosamente.",
      });
    }
  };

  const getTypeVariant = (type: AgronomistLog['type']) => {
    switch (type) {
      case 'Fertilización': return 'default';
      case 'Fumigación': return 'destructive';
      case 'Control': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Aplicaciones</CardTitle>
            <CardDescription>Registro de todas las aplicaciones de productos y controles realizados.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Producto/Notas</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {!isClient && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Cargando registros...
                    </TableCell>
                  </TableRow>
                )}
                {isClient && agronomistLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No hay registros de aplicaciones.</TableCell>
                  </TableRow>
                )}
                {isClient && agronomistLogs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell><Badge variant={getTypeVariant(log.type)}>{log.type}</Badge></TableCell>
                        <TableCell>
                          <p className="font-medium">{log.product || '-'}</p>
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        </TableCell>
                        <TableCell>
                          {log.imageUrl && (
                            <div className="relative w-24 h-16 rounded-md overflow-hidden">
                                <Image 
                                  src={log.imageUrl}
                                  alt={log.notes}
                                  fill
                                  className="object-cover"
                                  data-ai-hint={log.imageHint}
                                />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleEdit(log)}>Editar</DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Eliminar</DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de la aplicación.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(log.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro de Aplicación</DialogTitle>
          <DialogDescription>
            Actualice los detalles del registro. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Aplicación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Fertilización">Fertilización</SelectItem>
                            <SelectItem value="Fumigación">Fumigación</SelectItem>
                            <SelectItem value="Control">Control</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Producto Utilizado (Opcional)</FormLabel>
                        <FormControl>
                        <Input placeholder="ej., Nitrato de Calcio" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la aplicación, dosis, observaciones, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Note: Image editing is not implemented in this version for simplicity */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function BatchHistory() {
  const { batches, deleteBatch } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (batchId: string) => {
    deleteBatch(batchId);
    toast({
      title: "Lote Eliminado",
      description: `El lote ${batchId} ha sido eliminado exitosamente.`,
    });
  };

  const sortedBatches = [...batches].sort((a, b) => new Date(b.preloadedDate).getTime() - new Date(a.preloadedDate).getTime());

  return (
    <Card>
        <CardHeader>
            <CardTitle>Historial de Lotes</CardTitle>
            <CardDescription>Registro de todos los lotes pre-cargados para la cosecha.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>ID Lote</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Precarga</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                  {!isClient && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Cargando lotes...
                      </TableCell>
                    </TableRow>
                  )}
                  {isClient && sortedBatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No hay lotes registrados.</TableCell>
                    </TableRow>
                  )}
                  {isClient && sortedBatches.map((batch) => (
                      <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.id}</TableCell>
                          <TableCell>
                            <Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>
                              {batch.status === 'completed' ? 'Completado' : 'Pendiente'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(batch.preloadedDate).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell className="text-right">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Eliminar Lote</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el lote. Si este lote ya fue cosechado, los registros de cosecha asociados no serán eliminados pero quedarán sin un lote válido.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(batch.id)}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}

const chartConfig = {
  kilograms: {
    label: "Kilogramos",
    color: "hsl(var(--chart-1))",
  },
};

function BatchYieldChart() {
  const { harvests, batches } = useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const completedBatches = batches.filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime())
    .slice(0, 10);

  const chartData = completedBatches.map(batch => {
    const batchHarvests = harvests.filter(h => h.batchNumber === batch.id);
    const totalKilos = batchHarvests.reduce((sum, h) => sum + h.kilograms, 0);
    return {
      batch: batch.id,
      kilograms: totalKilos,
    };
  }).reverse(); // reverse to show chronologically

  if (!isClient) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Lote</CardTitle>
        <CardDescription>Kilogramos cosechados de los últimos 10 lotes completados.</CardDescription>
      </CardHeader>
      <CardContent>
         {chartData.length > 0 ? (
           <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="batch"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value} kg`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="kilograms" fill="var(--color-kilograms)" radius={4} />
            </BarChart>
          </ChartContainer>
         ) : (
          <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">No hay datos de lotes completados para mostrar.</p>
          </div>
         )}
      </CardContent>
    </Card>
  )
}


export default function EngineerLogPage() {
  const { collectors, harvests } = useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const totalProduction = harvests.reduce((acc, h) => acc + h.kilograms, 0);

  return (
    <>
      <PageHeader
        title="Bitácora del Agrónomo"
        description="Gestión de aplicaciones, lotes y visión general de la producción."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? totalProduction.toLocaleString('es-ES') : 'Cargando...'} kg</div>
            <p className="text-xs text-muted-foreground">Acumulado de la temporada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total de Insumos</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isClient ? engineerLogStats.totalInputs.toLocaleString('es-ES') : 'Cargando...'}</div>
            <p className="text-xs text-muted-foreground">Fertilizantes, agua, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio/kg</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isClient ? engineerLogStats.averagePrice.toFixed(2) : '...'}</div>
            <p className="text-xs text-muted-foreground">Promedio de mercado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recolectores</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? collectors.length : '...'}</div>
            <p className="text-xs text-muted-foreground">Activos esta temporada</p>
          </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="applications" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">
            <Sprout className="mr-2" />
            Gestión de Aplicaciones
          </TabsTrigger>
          <TabsTrigger value="batches">
            <Package className="mr-2" />
            Gestión de Lotes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <div className="grid gap-8 lg:grid-cols-2 mt-4">
            <ApplicationLogForm />
            <ApplicationHistory />
          </div>
        </TabsContent>
        <TabsContent value="batches">
           <div className="grid gap-8 lg:grid-cols-2 mt-4">
            <BatchLogForm />
            <BatchHistory />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
           <BatchYieldChart />
        </div>
        <div>
           <HarvestSummary />
        </div>
      </div>

      <div className="grid gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Visión General de Productividad de Recolectores</CardTitle>
                    <CardDescription>Resumen del rendimiento de cada recolector.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Total Cosechado (kg)</TableHead>
                            <TableHead className="text-right">Horas Trabajadas</TableHead>
                            <TableHead className="text-right">Productividad (kg/hr)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isClient && collectors.map((collector) => (
                            <TableRow key={collector.id}>
                            <TableCell className="font-medium">{collector.name}</TableCell>
                            <TableCell className="text-right">{collector.totalHarvested.toLocaleString('es-ES')}</TableCell>
                            <TableCell className="text-right">{collector.hoursWorked.toLocaleString('es-ES')}</TableCell>
                            <TableCell className="text-right font-bold">{collector.productivity.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
