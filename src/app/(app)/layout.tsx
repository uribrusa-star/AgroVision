

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Leaf, LayoutDashboard, Check, Loader2, PackageSearch, Menu, Building, NotebookPen, LogOut } from 'lucide-react';
import React, { useEffect, useState, useCallback, ReactNode } from 'react';
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
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
import { AppDataContext } from '@/context/app-data-context.tsx';
import { users as availableUsers, initialEstablishmentData } from '@/lib/data';
import type { Harvest, AppData, Collector, AgronomistLog, Batch, CollectorPaymentLog, User, EstablishmentData, PhenologyLog, ProducerLog, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const allNavItems = [
  { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/establishment', label: 'Establecimiento', icon: Building, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/producer-log', label: 'Bitácora del Productor', icon: NotebookPen, roles: ['Productor'] },
  { href: '/data-entry', label: 'Entrada de Datos', icon: StrawberryIcon, roles: ['Productor', 'Encargado'] },
  { href: '/engineer-log', label: 'Bitácora del Agrónomo', icon: Leaf, roles: ['Productor', 'Ingeniero Agronomo', 'Encargado'] },
  { href: '/collectors', label: 'Recolectores', icon: HardHat, roles: ['Productor', 'Encargado'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isClient, loading } = React.useContext(AppDataContext);
  const router = useRouter();

  useEffect(() => {
    if (isClient && !currentUser) {
      router.replace('/');
    }
  }, [isClient, currentUser, router]);

  if (!isClient || !currentUser) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando aplicación...</p>
          </div>
        </div>
    );
  }
  
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar collapsible='offcanvas'>
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2">
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
                <UserMenu />
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6 sticky top-0 z-30 md:hidden">
                <SidebarTrigger>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </SidebarTrigger>
                <div className="flex items-center gap-2">
                  <AgroVisionLogo className="w-6 h-6 text-primary" />
                  <span className="text-lg font-headline">AgroVision</span>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                  </div>
                ) : children}
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}


function UserMenu() {
  const { currentUser, users, setCurrentUser } = React.useContext(AppDataContext);
  const router = useRouter();
  
  if(!currentUser) return null;
  
  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  }
  
  return (
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
          <DropdownMenuLabel>Mi Perfil</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {currentUser.role === 'Productor' && (
            <>
                <DropdownMenuLabel>Cambiar Perfil</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={currentUser.id} onValueChange={(userId) => {
                    const selectedUser = users.find(u => u.id === userId);
                    if(selectedUser) {
                        setCurrentUser(selectedUser);
                    }
                }}>
                    {users.map((user) => (
                        <DropdownMenuRadioItem key={user.id} value={user.id}>
                            {user.name}
                            {currentUser.id === user.id && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
