'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { AppDataContext, AppContextProvider } from '@/context/app-data-context';
import { harvests as initialHarvests, collectors as initialCollectors, agronomistLogs as initialAgronomistLogs } from '@/lib/data';
import type { Harvest, AppData, Collector, AgronomistLog } from '@/lib/types';


const navItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf },
  { href: '/collectors', label: 'Recolectores', icon: HardHat },
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
  const [harvests, setHarvests] = usePersistentState<Harvest[]>('harvests', initialHarvests);
  const [collectors, setCollectors] = usePersistentState<Collector[]>('collectors', initialCollectors);
  const [agronomistLogs, setAgronomistLogs] = usePersistentState<AgronomistLog[]>('agronomistLogs', initialAgronomistLogs);


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

  const appData: AppData = {
    harvests,
    collectors,
    agronomistLogs,
    addHarvest,
    editCollector,
    deleteCollector,
    addAgronomistLog,
    editAgronomistLog,
    deleteAgronomistLog,
    addCollector,
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
                      <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="Admin" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                      <p className="text-xs text-muted-foreground">admin@agrovision.co</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
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
