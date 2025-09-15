
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const { isClient, loading, currentUser } = useContext(AppDataContext);
  const router = useRouter();

  useEffect(() => {
    // Wait until the client is ready and the auth check is complete
    if (isClient && !loading) {
      if (currentUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isClient, loading, currentUser, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
