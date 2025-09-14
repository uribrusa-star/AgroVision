

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AgroVisionLogo } from '@/components/icons';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';


export default function LoginPageContent() {
  const { setCurrentUser } = React.useContext(AppDataContext);
  const router = useRouter();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8">
        <AgroVisionLogo className="w-16 h-16 text-primary" />
        <h1 className="text-4xl font-headline text-foreground">Bienvenido a AgroVision</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Su asistente digital para la gestión de la producción de frutilla. Por favor, seleccione su perfil para continuar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {users.map((user) => (
          <Card key={user.id} className="text-center flex flex-col items-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/80/80`} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button onClick={() => handleLogin(user)}>Ingresar como {user.role}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

       <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AgroVision. Todos los derechos reservados.</p>
       </footer>
    </div>
  );
}

