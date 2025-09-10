'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
import { harvests as initialHarvests, collectors as initialCollectors, agronomistLogs as initialAgronomistLogs, batches as initialBatches, collectorPaymentLogs as initialCollectorPaymentLogs, users as availableUsers } from '@/lib/data';
import type { Harvest, AppData, Collector, AgronomistLog, Batch, CollectorPaymentLog, User } from '@/lib/types';


const allNavItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon, roles: ['Productor', 'Encargado'] },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/collectors', label: 'Recolectores', icon: HardHat, roles: ['Productor', 'Encargado'] },
];

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    // We can't use localStorage on the server, so we return the initial value.
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
  const [harvests, setHarvests] = usePersistentState<Harvest[]>('harvests', initialHarvests);
  const [collectors, setCollectors] = usePersistentState<Collector[]>('collectors', initialCollectors);
  const [agronomistLogs, setAgronomistLogs] = usePersistentState<AgronomistLog[]>('agronomistLogs', initialAgronomistLogs);
  const [batches, setBatches] = usePersistentState<Batch[]>('batches', initialBatches);
  const [collectorPaymentLogs, setCollectorPaymentLogs] = usePersistentState<CollectorPaymentLog[]>('collectorPaymentLogs', initialCollectorPaymentLogs);


  const addHarvest = (harvest: Harvest) => {
    setHarvests(prevHarvests => [harvest, ...prevHarvests]);
    setCollectors(prevCollectors => prevCollectors.map(c => {
      if (c.id === harvest.collector.id) {
        const newTotalHarvested = c.totalHarvested + harvest.kilograms;
        // Assuming some fixed hours for simplicity
        const newHoursWorked = c.hoursWorked + 4;
        return {
          ...c,
          totalHarvested: newTotalHarvested,
          hoursWorked: newHoursWorked,
          productivity: newTotalHarvested / newHoursWorked
        };
      }
      return c;
    }));
    setBatches(prevBatches => prevBatches.map(b => 
      b.id === harvest.batchNumber 
        ? { ...b, status: 'completed', completionDate: new Date().toISOString() } 
        : b
    ));
  };

  const editCollector = (updatedCollector: Collector) => {
    setCollectors(prevCollectors => prevCollectors.map(c => c.id === updatedCollector.id ? updatedCollector : c));
  };

  const deleteCollector = (collectorId: string) => {
    setCollectors(prevCollectors => prevCollectors.filter(c => c.id !== collectorId));
    // Optional: also remove harvests associated with the deleted collector
    setHarvests(prevHarvests => prevHarvests.filter(h => h.collector.id !== collectorId));
  };

  const addAgronomistLog = (log: AgronomistLog) => {
    setAgronomistLogs(prevLogs => [log, ...prevLogs]);
  };

  const editAgronomistLog = (updatedLog: AgronomistLog) => {
    setAgronomistLogs(prevLogs => prevLogs.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteAgronomistLog = (logId: string) => {
    setAgronomistLogs(prevLogs => prevLogs.filter(l => l.id !== logId));
  };

  const addCollector = (collector: Collector) => {
    setCollectors(prevCollectors => [collector, ...prevCollectors]);
  };

  const addBatch = (batch: Batch) => {
    setBatches(prevBatches => [batch, ...prevBatches]);
  };
  
  const deleteBatch = (batchId: string) => {
    setBatches(prevBatches => prevBatches.filter(b => b.id !== batchId));
  }

  const addCollectorPaymentLog = (log: CollectorPaymentLog) => {
    setCollectorPaymentLogs(prevLogs => [log, ...prevLogs]);
  }

  const deleteCollectorPaymentLog = (logId: string) => {
    setCollectorPaymentLogs(prevLogs => prevLogs.filter(l => l.id !== logId));
  }

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
  };
  
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));


  const appData: AppData = {
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
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppContextProvider>
  );
}
