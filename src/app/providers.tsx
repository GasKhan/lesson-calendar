'use client';

import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <ToastProvider>
        <AppProvider>{children}</AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
