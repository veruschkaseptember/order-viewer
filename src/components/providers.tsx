'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: unknown) => {
          if (
            typeof error === 'object' &&
            error !== null &&
            'status' in error
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        {children}
        <Toaster
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            duration: 4000,
          }}
        />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
