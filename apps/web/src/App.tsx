import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@repo/ui';
import { queryClient } from './lib/queryClient.ts';
import { AppRouter } from './routes/index.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
