'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Smartphone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, otpSchema, verifyOtpSchema, type LoginInput } from '@/lib/validations';

export default function LoginPage() {
  const { login, isLoggingIn, sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');

  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm<{ mobile: string }>({ resolver: zodResolver(otpSchema) });
  const otpVerifyForm = useForm<{ otp: string }>({ resolver: zodResolver(verifyOtpSchema.pick({ otp: true })) });

  const handleSendOtp = (data: { mobile: string }) => {
    setOtpMobile(data.mobile);
    sendOtp(data.mobile, {
      onSuccess: () => setOtpSent(true),
    });
  };

  const handleVerifyOtp = (data: { otp: string }) => {
    verifyOtp({ mobile: otpMobile, otp: data.otp });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-heading font-bold text-primary-500">Job Katta</h1>
            <p className="text-sm text-slate-500 mt-1">Apni Naukri, Apne Shehar Mein</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-heading font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" /> Email</TabsTrigger>
              <TabsTrigger value="otp" className="gap-2"><Smartphone className="h-4 w-4" /> Mobile OTP</TabsTrigger>
            </TabsList>

            {/* Email / Password Tab */}
            <TabsContent value="email">
              <form onSubmit={loginForm.handleSubmit((d) => login(d))} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="mt-1" {...loginForm.register('email')} />
                  {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative mt-1">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...loginForm.register('password')} />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* OTP Tab */}
            <TabsContent value="otp">
              {!otpSent ? (
                <form onSubmit={otpForm.handleSubmit(handleSendOtp)} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile">Mobile number</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-sm text-slate-600">+91</span>
                      <Input id="mobile" type="tel" maxLength={10} placeholder="9876543210" className="rounded-l-none" {...otpForm.register('mobile')} />
                    </div>
                    {otpForm.formState.errors.mobile && <p className="text-red-500 text-xs mt-1">{otpForm.formState.errors.mobile.message}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={isSendingOtp}>
                    {isSendingOtp ? 'Sending OTP…' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={otpVerifyForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                  <p className="text-sm text-slate-600">OTP sent to <strong>+91 {otpMobile}</strong></p>
                  <div>
                    <Label htmlFor="otp">Enter 6-digit OTP</Label>
                    <Input id="otp" type="tel" maxLength={6} placeholder="123456" className="mt-1 text-center text-xl tracking-widest font-mono" {...otpVerifyForm.register('otp')} />
                    {otpVerifyForm.formState.errors.otp && <p className="text-red-500 text-xs mt-1">{(otpVerifyForm.formState.errors.otp as { message?: string }).message}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={isVerifyingOtp}>
                    {isVerifyingOtp ? 'Verifying…' : 'Verify & Login'}
                  </Button>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-slate-500 hover:text-primary-500">Change number</button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-500 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
