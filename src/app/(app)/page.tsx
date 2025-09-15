

'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const { isClient, loading, currentUser } = useContext(AppDataContext);
  const router = useRouter();

  useEffect(() => {
    // Wait until the client is ready and the user is set
    if (isClient && !loading && currentUser) {
      router.replace('/dashboard');
    }
  }, [isClient, loading, currentUser, router]);

<<<<<<< HEAD

  const onSubmit = async (values: LoginFormValues) => {
    startTransition(async () => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
            title: `¡Bienvenido de nuevo!`,
            description: "Ha iniciado sesión correctamente.",
        });
        setCurrentUser(result.user, values.rememberMe);
        router.refresh(); // Refresh the page to trigger middleware and context reload
      } else {
        form.setError("root", { message: result.error || "Correo electrónico o contraseña incorrectos."});
      }
    });
  };

  if (!isClient || currentUser) {
    return null; // or a loading spinner
  }

=======
>>>>>>> fb7908ce8ca33e75e47cd1b785f6f932b8826159
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando aplicación...</p>
      </div>
    </div>
  );
}
