'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard, Check, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';

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
import { users as availableUsers } from '@/lib/data';
import type { Harvest, AppData, Collector, AgronomistLog, Batch, CollectorPaymentLog, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const allNavItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon, roles: ['Productor', 'Encargado'] },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/collectors', label: 'Recolectores', icon: HardHat, roles: ['Productor', 'Encargado'] },
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
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = usePersistentState<User>('currentUser', availableUsers.find(u => u.role === 'Productor')!);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [agronomistLogs, setAgronomistLogs] = useState<AgronomistLog[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [collectorPaymentLogs, setCollectorPaymentLogs] = useState<CollectorPaymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [collectorsSnapshot, harvestsSnapshot, agronomistLogsSnapshot, batchesSnapshot, paymentLogsSnapshot] = await Promise.all([
        getDocs(query(collection(db, "collectors"), orderBy("joinDate", "desc"))),
        getDocs(query(collection(db, "harvests"), orderBy("date", "desc"))),
        getDocs(query(collection(db, "agronomistLogs"), orderBy("date", "desc"))),
        getDocs(query(collection(db, "batches"), orderBy("preloadedDate", "desc"))),
        getDocs(query(collection(db, "collectorPaymentLogs"), orderBy("date", "desc"))),
      ]);

      setCollectors(collectorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collector)));
      setHarvests(harvestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Harvest)));
      setAgronomistLogs(agronomistLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgronomistLog)));
      setBatches(batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
      setCollectorPaymentLogs(paymentLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollectorPaymentLog)));

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const addHarvest = async (harvest: Omit<Harvest, 'id'>) => {
    const docRef = await addDoc(collection(db, "harvests"), harvest);
    const newHarvest = { id: docRef.id, ...harvest } as Harvest;
    setHarvests(prev => [newHarvest, ...prev]);

    const collectorRef = doc(db, "collectors", harvest.collector.id);
    const collector = collectors.find(c => c.id === harvest.collector.id);
    if(collector) {
      const newTotalHarvested = collector.totalHarvested + harvest.kilograms;
      const newHoursWorked = collector.hoursWorked + 4; // Assuming 4 hours per harvest
      const newProductivity = newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0;
      await updateDoc(collectorRef, { 
          totalHarvested: newTotalHarvested,
          hoursWorked: newHoursWorked,
          productivity: newProductivity,
      });
      fetchData(); // Re-fetch to get updated state
    }
  };
  
  const editCollector = async (updatedCollector: Collector) => {
    const { id, ...dataToUpdate } = updatedCollector;
    await updateDoc(doc(db, "collectors", id), dataToUpdate);
    fetchData();
  };

  const deleteCollector = async (collectorId: string) => {
    const batch = writeBatch(db);

    // Delete the collector
    const collectorRef = doc(db, "collectors", collectorId);
    batch.delete(collectorRef);

    // Find and delete associated harvests
    const associatedHarvests = harvests.filter(h => h.collector.id === collectorId);
    associatedHarvests.forEach(h => {
        const harvestRef = doc(db, "harvests", h.id);
        batch.delete(harvestRef);
    });

    // Find and delete associated payment logs
    const associatedPayments = collectorPaymentLogs.filter(p => p.collectorId === collectorId);
    associatedPayments.forEach(p => {
        const paymentRef = doc(db, "collectorPaymentLogs", p.id);
        batch.delete(paymentRef);
    });

    await batch.commit();
    fetchData();
  };

  const addCollector = async (collector: Omit<Collector, 'id'>) => {
    await addDoc(collection(db, "collectors"), collector);
    fetchData();
  };
  
  const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
    await addDoc(collection(db, "agronomistLogs"), log);
    fetchData();
  };

  const editAgronomistLog = async (updatedLog: AgronomistLog) => {
    const { id, ...dataToUpdate } = updatedLog;
    await updateDoc(doc(db, "agronomistLogs", id), dataToUpdate);
    fetchData();
  };

  const deleteAgronomistLog = async (logId: string) => {
    await deleteDoc(doc(db, "agronomistLogs", logId));
    fetchData();
  };

  const addBatch = async (batch: Omit<Batch, 'id'>) => {
    await addDoc(collection(db, "batches"), batch);
    fetchData();
  };
  
  const deleteBatch = async (batchId: string) => {
    await deleteDoc(doc(db, "batches", batchId));
    fetchData();
  };

  const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
    await addDoc(collection(db, "collectorPaymentLogs"), log);
    fetchData();
  };

  const deleteCollectorPaymentLog = async (logId: string) => {
    const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
    if (!logToDelete) return;

    const batch = writeBatch(db);

    // Delete payment log
    const paymentLogRef = doc(db, "collectorPaymentLogs", logId);
    batch.delete(paymentLogRef);
    
    // Delete associated harvest
    const harvestRef = doc(db, "harvests", logToDelete.harvestId);
    batch.delete(harvestRef);

    await batch.commit();
    fetchData();
  };

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
  };
  
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));


  const appData: AppData = {
    loading,
    currentUser,
    users: availableUsers,
    setCurrentUser: handleSetCurrentUser,
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
  };

  return (
    <AppContextProvider value={appData}>
      <SidebarProvider>
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
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://picsum.photos/seed/${currentUser.avatar}/40/40`} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
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
                            handleSetCurrentUser(user);
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
              <SidebarTrigger />
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
                    <p className="text-muted-foreground">Cargando datos desde la nube...</p>
                  </div>
                </div>
              ) : children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppContextProvider>
  );
}
