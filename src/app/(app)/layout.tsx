
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard, Check, Loader2, PackageSearch } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  documentId,
} from 'firebase/firestore';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { AgroVisionLogo, StrawberryIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { AppDataContext, AppContextProvider } from '@/context/app-data-context';
import { users as availableUsers, harvests as initialHarvests, collectors as initialCollectors, agronomistLogs as initialAgronomistLogs, batches as initialBatches, collectorPaymentLogs as initialCollectorPaymentLogs } from '@/lib/data';
import type { Harvest, AppData, Collector, AgronomistLog, Batch, CollectorPaymentLog, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const allNavItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon, roles: ['Productor', 'Encargado'] },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/collectors', label: 'Recolectores', icon: HardHat, roles: ['Productor', 'Encargado'] },
  { href: '/lots', label: 'Lotes', icon: PackageSearch, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
];

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

const useAppData = () => {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = usePersistentState<User>('currentUser', availableUsers.find(u => u.role === 'Productor')!);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [agronomistLogs, setAgronomistLogs] = useState<AgronomistLog[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [collectorPaymentLogs, setCollectorPaymentLogs] = useState<CollectorPaymentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const [
          collectorsSnapshot,
          harvestsSnapshot,
          agronomistLogsSnapshot,
          batchesSnapshot,
          collectorPaymentsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'collectors')),
          getDocs(collection(db, 'harvests')),
          getDocs(collection(db, 'agronomistLogs')),
          getDocs(collection(db, 'batches')),
          getDocs(collection(db, 'collectorPaymentLogs')),
        ]);
        
        setCollectors(collectorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Collector[]);
        setHarvests(harvestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Harvest[]);
        setAgronomistLogs(agronomistLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AgronomistLog[]);
        setBatches(batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[]);
        setCollectorPaymentLogs(collectorPaymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CollectorPaymentLog[]);

      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        toast({
          title: "Error de Conexión",
          description: "No se pudieron cargar los datos. Asegúrese de que Firestore esté configurado y con las reglas de seguridad correctas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    }, [toast]);
    
    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, [fetchData]);

    const addHarvest = async (harvest: Omit<Harvest, 'id'>) => {
        const tempId = `H${Date.now()}`;
        const newHarvestRef = doc(db, 'harvests', tempId);
        const collectorRef = doc(db, 'collectors', harvest.collector.id);
        
        const collectorDoc = collectors.find(c => c.id === harvest.collector.id);
        if (!collectorDoc) {
          console.error("Collector not found in state");
          return;
        }

        const newTotalHarvested = collectorDoc.totalHarvested + harvest.kilograms;
        const newHoursWorked = collectorDoc.hoursWorked + 4; // Assuming 4 hours
        
        const batch = writeBatch(db);
        batch.set(newHarvestRef, harvest);
        batch.update(collectorRef, {
            totalHarvested: newTotalHarvested,
            hoursWorked: newHoursWorked,
            productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
        });

        await batch.commit();
        await fetchData(); // Refetch all data to keep client state in sync
    };

    const editCollector = async (updatedCollector: Collector) => {
        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...data } = updatedCollector;
        await setDoc(collectorRef, data, { merge: true });
        await fetchData();
    };

    const deleteCollector = async (collectorId: string) => {
        const batch = writeBatch(db);

        // Delete the collector
        const collectorRef = doc(db, 'collectors', collectorId);
        batch.delete(collectorRef);

        // Find and delete associated harvests
        const harvestsToDelete = harvests.filter(h => h.collector.id === collectorId);
        harvestsToDelete.forEach(h => batch.delete(doc(db, 'harvests', h.id)));

        // Find and delete associated payment logs
        const paymentsToDelete = collectorPaymentLogs.filter(p => p.collectorId === collectorId);
        paymentsToDelete.forEach(p => batch.delete(doc(db, 'collectorPaymentLogs', p.id)));

        await batch.commit();
        await fetchData();
    };

    const addCollector = async (collector: Omit<Collector, 'id'>) => {
        const tempId = `C${Date.now()}`;
        const newCollectorRef = doc(db, 'collectors', tempId);
        await setDoc(newCollectorRef, collector);
        await fetchData();
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        const tempId = `LOG${Date.now()}`;
        const newLogRef = doc(db, 'agronomistLogs', tempId);
        await setDoc(newLogRef, log);
        await fetchData();
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        const logRef = doc(db, 'agronomistLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        await setDoc(logRef, data, { merge: true });
        await fetchData();
    };

    const deleteAgronomistLog = async (logId: string) => {
        await deleteDoc(doc(db, 'agronomistLogs', logId));
        await fetchData();
    };

    const addBatch = async (batchData: Omit<Batch, 'id'>) => {
        // Use the user-provided ID
        const newBatchRef = doc(db, 'batches', batchData.id);
        await setDoc(newBatchRef, batchData);
        await fetchData();
    };


    const deleteBatch = async (batchId: string) => {
        await deleteDoc(doc(db, 'batches', batchId));
        await fetchData();
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        const tempId = `PAY${Date.now()}`;
        const newLogRef = doc(db, 'collectorPaymentLogs', tempId);
        // We need to update the harvestId with the real ID
        const harvestRef = doc(db, 'harvests', log.harvestId);
        await setDoc(newLogRef, {...log, harvestId: harvestRef.id });
        await fetchData();
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
      const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
      if (!logToDelete) return;
  
      const batch = writeBatch(db);
      
      const paymentLogRef = doc(db, 'collectorPaymentLogs', logId);
      batch.delete(paymentLogRef);
      
      // Delete the associated harvest record
      const harvestRef = doc(db, 'harvests', logToDelete.harvestId);
      batch.delete(harvestRef);
      
      await batch.commit();
      await fetchData();
    };

    return {
        loading,
        currentUser,
        users: availableUsers,
        setCurrentUser,
        harvests,
        collectors,
        agronomistLogs,
        batches,
        collectorPaymentLogs,
        addHarvest,
        editCollector,
        deleteCollector,
        addAgronomistLog,
        editAgronomistLog,
        deleteAgronomistLog,
        addCollector,
        addBatch,
        deleteBatch,
        addCollectorPaymentLog,
        deleteCollectorPaymentLog,
        isClient
    };
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const appData = useAppData();
  const { currentUser, setCurrentUser, isClient, loading } = appData;
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppContextProvider value={appData}>
      <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <AgroVisionLogo className="w-8 h-8 text-primary" />
                <span className="text-xl font-headline text-sidebar-foreground">AgroVision</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start gap-2 w-full p-2 h-12">
                     {isClient ? (
                        <>
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://picsum.photos/seed/${currentUser.avatar}/40/40`} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                        </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 w-full">
                           <Skeleton className="h-8 w-8 rounded-full" />
                           <div className="flex flex-col gap-1 w-full">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                           </div>
                        </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuLabel>Cambiar Perfil</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentUser.id}
                    onValueChange={(userId) => {
                        const user = availableUsers.find(u => u.id === userId);
                        if (user) {
                            setCurrentUser(user);
                        }
                    }}
                  >
                    {availableUsers.map(user => (
                        <DropdownMenuRadioItem key={user.id} value={user.id} className="gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/40/40`} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                           <span>{user.name}</span>
                        </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6 sticky top-0 z-30 md:hidden">
              <SidebarTrigger onClick={() => setIsSidebarOpen(prev => !prev)} />
              <div className="flex items-center gap-2">
                <AgroVisionLogo className="w-6 h-6 text-primary" />
                <span className="text-lg font-headline">AgroVision</span>
              </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando datos...</p>
                  </div>
                </div>
              ) : children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppContextProvider>
  );
}
