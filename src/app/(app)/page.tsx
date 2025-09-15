
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const { loading, currentUser } = useContext(AppDataContext);
  const router = useRouter();

  useEffect(() => {
    // This effect now only handles the case where a user somehow lands here
    // without being authenticated, sending them back to the login page.
    // The redirect *to* the dashboard after login is handled by the login page itself.
    if (!loading && !currentUser) {
        router.replace('/');
    }
  }, [loading, currentUser, router]);

  // If the user is authenticated, we want to show the dashboard by default
  // when navigating to the root of the app section.
  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/dashboard');
    }
  }, [loading, currentUser, router]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
