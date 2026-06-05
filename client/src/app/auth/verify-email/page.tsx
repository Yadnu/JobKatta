'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => { setStatus('success'); setMessage('Your email has been verified successfully!'); })
      .catch((err) => { setStatus('error'); setMessage(err?.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <Link href="/" className="block mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-500">Job Katta</h1>
        </Link>

        {status === 'loading' && (
          <><Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" /><p className="text-slate-600">Verifying your email…</p></>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-slate-800 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Button asChild className="bg-primary-500 hover:bg-primary-600"><Link href="/auth/login">Sign In Now</Link></Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Button asChild variant="outline"><Link href="/auth/login">Go to Login</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
