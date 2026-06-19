'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {error.message || 'Failed to load jobs. Please try again.'}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
