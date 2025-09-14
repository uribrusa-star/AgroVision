
'use client';

import React from 'react';
import { AppContextProvider } from '@/context/app-data-context.tsx';
import LoginPageContent from '@/app/(app)/page.tsx';


export default function LoginPage() {

  return (
    <AppContextProvider>
      <LoginPageContent />
    </AppContextProvider>
  );
}
