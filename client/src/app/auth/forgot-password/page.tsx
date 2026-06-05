'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema } from '@/lib/validations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="text-3xl font-heading font-bold text-primary-500">Job Katta</h1></Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-semibold text-slate-800 mb-2">Check your email</h2>
              <p className="text-slate-600 mb-6">If this email is registered with Job Katta, you will receive a password reset link shortly.</p>
              <Link href="/auth/login" className="text-primary-500 hover:underline text-sm font-medium">Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-heading font-semibold text-slate-800 mb-2">Forgot your password?</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your registered email and we will send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="mt-1" {...register('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-4">
                <Link href="/auth/login" className="text-primary-500 hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
