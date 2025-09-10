'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard, Check, Loader2, PackageSearch } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
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

const allNavItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon, roles: ['Productor', 'Encargado'] },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/collectors', label: 'Recolectores', icon: HardHat, roles: ['Productor', 'Encargado'] },
  { href: '/lots', label: 'Lotes', icon: PackageSearch, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
];

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, state, isInitialized]);

  return [state, setState];
};

const useAppData = () => {
    const [currentUser, setCurrentUser] = usePersistentState<User>('currentUser', availableUsers.find(u => u.role === 'Productor')!);
    const [harvests, setHarvests] = usePersistentState<Harvest[]>('harvests', initialHarvests);
    const [collectors, setCollectors] = usePersistentState<Collector[]>('collectors', initialCollectors);
    const [agronomistLogs, setAgronomistLogs] = usePersistentState<AgronomistLog[]>('agronomistLogs', initialAgronomistLogs);
    const [batches, setBatches] = usePersistentState<Batch[]>('batches', initialBatches);
    const [collectorPaymentLogs, setCollectorPaymentLogs] = usePersistentState<CollectorPaymentLog[]>('collectorPaymentLogs', initialCollectorPaymentLogs);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setLoading(false);
    }, []);

  const addHarvest = async (harvest: Omit<Harvest, 'id'>) => {
    setHarvests(prev => {
      const newHarvest = { ...harvest, id: `H${prev.length + 1}` } as Harvest;
      return [newHarvest, ...prev];
    });
    setCollectors(prev => prev.map(c => {
        if (c.id === harvest.collector.id) {
            const newTotalHarvested = c.totalHarvested + harvest.kilograms;
            const newHoursWorked = c.hoursWorked + 4; // Assuming 4 hours
            return {
                ...c,
                totalHarvested: newTotalHarvested,
                hoursWorked: newHoursWorked,
                productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
            };
        }
        return c;
    }));
  };

  const editCollector = async (updatedCollector: Collector) => {
    setCollectors(prev => prev.map(c => c.id === updatedCollector.id ? updatedCollector : c));
  };

  const deleteCollector = async (collectorId: string) => {
     setCollectors(prev => prev.filter(c => c.id !== collectorId));
     setHarvests(prev => prev.filter(h => h.collector.id !== collectorId));
     setCollectorPaymentLogs(prev => prev.filter(p => p.collectorId !== collectorId));
  };

  const addCollector = async (collector: Omit<Collector, 'id'>) => {
    setCollectors(prev => [{ ...collector, id: `C${prev.length + 1}` } as Collector, ...prev]);
  };
  
  const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
    setAgronomistLogs(prev => [{ ...log, id: `LOG${prev.length + 1}` } as AgronomistLog, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const editAgronomistLog = async (updatedLog: AgronomistLog) => {
    setAgronomistLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteAgronomistLog = async (logId: string) => {
    setAgronomistLogs(prev => prev.filter(l => l.id !== logId));
  };

  const addBatch = async (batch: Omit<Batch, 'id'>) => {
     setBatches(prev => [{...batch} as Batch, ...prev].sort((a,b) => new Date(b.preloadedDate).getTime() - new Date(a.preloadedDate).getTime()))
  };

  const deleteBatch = async (batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
  };

  const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
    setCollectorPaymentLogs(prev => [{ ...log, id: `PAY${prev.length + 1}` } as CollectorPaymentLog, ...prev]);
  };

  const deleteCollectorPaymentLog = async (logId: string) => {
    const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
    if (!logToDelete) return;
    
    setCollectorPaymentLogs(prev => prev.filter(l => l.id !== logId));
    setHarvests(prev => prev.filter(h => h.id !== logToDelete.harvestId));
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
