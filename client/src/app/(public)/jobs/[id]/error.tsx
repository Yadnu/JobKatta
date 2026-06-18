'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobDetailError({
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
      <h2 className="text-xl font-semibold text-slate-800">Failed to load job</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {error.message || 'This job posting could not be loaded. Please try again.'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/jobs">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    </div>
  );
}
