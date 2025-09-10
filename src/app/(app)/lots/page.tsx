
'use client';

import { useState, useContext } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf } from "lucide-react";
import { AppDataContext } from "@/context/app-data-context";
import { Skeleton } from "@/components/ui/skeleton";


export default function LotsPage() {
  const { loading, batches, harvests } = useContext(AppDataContext);
  const [filterProductor, setFilterProductor] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");

  const processedLots = batches.map(batch => {
    const batchHarvests = harvests.filter(h => h.batchNumber === batch.id);
    const totalKg = batchHarvests.reduce((sum, h) => sum + h.kilograms, 0);
    // Assuming a fixed surface area and productivity calculation for now
    const superficie_ha = 1.5; 
    const productividad = superficie_ha > 0 ? totalKg / superficie_ha : 0;
    const isActive = batchHarvests.length > 0 || batch.status === 'pending';
    
    return {
        id: batch.id,
        nombre: batch.id,
        productor: "Productor Admin", // Placeholder
        superficie_ha,
        estado: isActive ? 'activo' : 'inactivo',
        historial: batchHarvests.map(h => ({ fecha: h.date, kg: h.kilograms })),
        productividad,
    }
  });

  const filteredLots = processedLots.filter(
    (lot) =>
      (filterProductor === "" || lot.productor.toLowerCase().includes(filterProductor.toLowerCase())) &&
      (filterEstado === "all" || lot.estado === filterEstado)
  );

  const getProductivityColor = (productivity: number) => {
    if (productivity > 100) return "bg-green-500";
    if (productivity > 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      <PageHeader
        title="Visualización de Lotes"
        description="Información detallada y productividad de cada lote."
      />
      
      <Card className="mb-8">
        <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                type="text"
                placeholder="Filtrar por productor..."
                className="flex-1"
                value={filterProductor}
                onChange={(e) => setFilterProductor(e.target.value)}
                />
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
            Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))
        )}
        {!loading && filteredLots.map((lot) => (
            <Card key={lot.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{lot.nombre}</CardTitle>
                            <CardDescription>{lot.productor}</CardDescription>
                        </div>
                        <Badge variant={lot.estado === 'activo' ? 'default' : 'destructive'}>{lot.estado}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm">
                        <p><span className="font-semibold">Superficie:</span> {lot.superficie_ha} ha</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Productividad: {lot.productividad.toFixed(2)} kg/ha</label>
                        <Progress value={lot.productividad} max={150} indicatorClassName={getProductivityColor(lot.productividad)} className="h-2" />
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Ver Historial de Cosechas</AccordionTrigger>
                            <AccordionContent>
                                {lot.historial.length > 0 ? (
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead className="text-right">Kilogramos</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lot.historial.map((h, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{new Date(h.fecha).toLocaleDateString('es-ES')}</TableCell>
                                                    <TableCell className="text-right">{h.kg} kg</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay historial de cosechas para este lote.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        ))}
      </div>
      {!loading && filteredLots.length === 0 && (
        <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <Leaf className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No se encontraron lotes</h3>
                <p className="text-muted-foreground">Intente ajustar los filtros de búsqueda.</p>
            </CardContent>
        </Card>
      )}
    </>
  );
}
