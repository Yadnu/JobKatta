'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema } from '@/lib/validations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ResetForm { password: string; confirmPassword: string; }

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    try {
      await api.post('/auth/reset-password', { token, email, password: data.password });
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed';
      toast.error(msg);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-slate-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-500 mb-4">Invalid reset link.</p>
          <Button asChild><Link href="/auth/forgot-password">Request new link</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="text-3xl font-heading font-bold text-primary-500">Job Katta</h1></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-semibold mb-2">Password reset!</h2>
              <p className="text-slate-600">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-heading font-semibold text-slate-800 mb-6">Set new password</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative mt-1">
                    <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 digit" {...register('password')} />
                    <button type="button" onClick={() => setShowPwd((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Re-enter password" className="mt-1" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting…' : 'Reset Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
