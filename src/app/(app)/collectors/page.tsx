'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { collectors, harvests } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function CollectorsPage() {
  const getCollectorHistory = (collectorId: string) => {
    return harvests.filter(h => h.collector.id === collectorId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <>
      <PageHeader
        title="Collector Management"
        description="View, manage, and track the productivity of your collectors."
      >
        <Button>Add New Collector</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>All Collectors</CardTitle>
          <CardDescription>A list of all collectors in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Total Harvested</TableHead>
                <TableHead className="hidden md:table-cell">Productivity (kg/hr)</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${collector.avatar}/40/40`} alt={collector.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{collector.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{collector.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{collector.totalHarvested.toLocaleString()} kg</TableCell>
                  <TableCell className="hidden md:table-cell">{collector.productivity.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(collector.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View History</DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Harvest History: {collector.name}</DialogTitle>
                          <DialogDescription>
                            Review all harvest entries for this collector.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead className="text-right">Kilograms</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const history = getCollectorHistory(collector.id);
                                if (history.length > 0) {
                                  return history.map(h => (
                                    <TableRow key={h.id}>
                                      <TableCell>{new Date(h.date).toLocaleDateString()}</TableCell>
                                      <TableCell><Badge variant="outline">{h.batchNumber}</Badge></TableCell>
                                      <TableCell className="text-right font-medium">{h.kilograms} kg</TableCell>
                                    </TableRow>
                                  ));
                                }
                                return (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center">No harvest history found.</TableCell>
                                  </TableRow>
                                );
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
