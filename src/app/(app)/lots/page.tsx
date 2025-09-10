'use client';

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf } from "lucide-react";


const exampleLots = [
  {
    id: "lote1",
    nombre: "Lote Norte",
    productor: "Productor Admin",
    superficie_ha: 1.5,
    estado: "activo",
    polygon: [
      [-31.4523, -60.7254],
      [-31.4525, -60.7240],
      [-31.4535, -60.7245],
      [-31.4530, -60.7260],
    ],
    historial: [
      { fecha: "2024-07-01", kg: 120 },
      { fecha: "2024-07-02", kg: 110 },
    ],
    productividad: 80, // kg/ha
  },
  {
    id: "lote2",
    nombre: "Lote Sur",
    productor: "Encargado de Campo",
    superficie_ha: 2.0,
    estado: "inactivo",
    polygon: [
      [-31.4550, -60.7300],
      [-31.4555, -60.7285],
      [-31.4565, -60.7290],
      [-31.4560, -60.7310],
    ],
    historial: [
      { fecha: "2024-07-01", kg: 80 },
      { fecha: "2024-07-02", kg: 90 },
    ],
    productividad: 45, // kg/ha
  },
    {
    id: "lote3",
    nombre: "Lote Este",
    productor: "Productor Admin",
    superficie_ha: 1.2,
    estado: "activo",
    polygon: [],
    historial: [
      { fecha: "2024-07-03", kg: 150 },
      { fecha: "2024-07-04", kg: 145 },
    ],
    productividad: 120, // kg/ha
  },
];

export default function LotsPage() {
  const [filterProductor, setFilterProductor] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const filteredLots = exampleLots.filter(
    (lot) =>
      (filterProductor === "" || lot.productor.toLowerCase().includes(filterProductor.toLowerCase())) &&
      (filterEstado === "" || lot.estado === filterEstado)
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
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                type="text"
                placeholder="Filtrar por productor..."
                className="flex-1"
                value={filterProductor}
                onChange={(e) => setFilterProductor(e.target.value)}
                />
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLots.map((lot) => (
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
                        <label className="text-sm font-medium">Productividad: {lot.productividad} kg/ha</label>
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
      {filteredLots.length === 0 && (
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
