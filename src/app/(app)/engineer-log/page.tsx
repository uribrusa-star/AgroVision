'use client';

import { useActionState, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { DollarSign, HardHat, Tractor, Weight } from 'lucide-react';
import { collectors, engineerLogStats, harvests } from '@/lib/data';
import { handleSummarizeHarvest } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  summary: '',
  loading: false,
};

function HarvestSummary() {
  const [state, formAction] = useActionState(handleSummarizeHarvest, initialState);
  const [showSummary, setShowSummary] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSummary(true);
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>AI Harvest Summary</CardTitle>
          <CardDescription>Generate a comprehensive summary of all harvest data using AI to identify trends and insights.</CardDescription>
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
                <AlertTitle>Generated Summary</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{state.summary}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
        <CardFooter>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function EngineerLogPage() {
  return (
    <>
      <PageHeader
        title="Agronomist's Log"
        description="Advanced cross-validation and production overview."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineerLogStats.totalProduction.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">Season to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inputs Cost</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${engineerLogStats.totalInputs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Fertilizers, water, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price/kg</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${engineerLogStats.averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Market average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collectors</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineerLogStats.collectorCount}</div>
            <p className="text-xs text-muted-foreground">Active this season</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Collector Productivity Overview</CardTitle>
                    <CardDescription>Summary of each collector's performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Total Harvested (kg)</TableHead>
                            <TableHead className="text-right">Hours Worked</TableHead>
                            <TableHead className="text-right">Productivity (kg/hr)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {collectors.map((collector) => (
                            <TableRow key={collector.id}>
                            <TableCell className="font-medium">{collector.name}</TableCell>
                            <TableCell className="text-right">{collector.totalHarvested.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{collector.hoursWorked}</TableCell>
                            <TableCell className="text-right font-bold">{collector.productivity.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
          <HarvestSummary />
        </div>
      </div>
    </>
  );
}
