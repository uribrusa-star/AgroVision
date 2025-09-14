
'use client';

import React from 'react';
// AppContextProvider is no longer needed here as it's provided in the root layout
import LoginPageContent from '@/app/(app)/page.tsx';


export default function LoginPage() {
  // We can directly render the content, as the context is provided by the parent layout.
  return <LoginPageContent />;
}

