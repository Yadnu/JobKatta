import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
        <SearchX className="h-10 w-10 text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800">404</h1>
      <p className="mt-2 text-lg font-semibold text-slate-600">Page not found</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    </div>
  );
}
