'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { INDIAN_STATES } from '@/lib/constants';

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CANDIDATE' },
  });

  const onRoleChange = (r: 'CANDIDATE' | 'EMPLOYER') => {
    setRole(r);
    form.setValue('role', r);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-heading font-bold text-primary-500">Job Katta</h1>
            <p className="text-sm text-slate-500 mt-1">Apni Naukri, Apne Shehar Mein</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-heading font-semibold text-slate-800 mb-6">Create your account</h2>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'CANDIDATE', label: 'I am looking for a job', Icon: UserCircle2 },
              { value: 'EMPLOYER', label: 'I want to hire', Icon: Building2 },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onRoleChange(value as 'CANDIDATE' | 'EMPLOYER')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                  role === value
                    ? 'border-primary-500 bg-orange-50 text-primary-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                <Icon className={cn('h-6 w-6', role === value ? 'text-primary-500' : 'text-slate-400')} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={form.handleSubmit((d) => registerUser(d))} className="space-y-4">
            {role === 'CANDIDATE' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="Rahul" className="mt-1" {...form.register('firstName')} />
                  {form.formState.errors.firstName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Sharma" className="mt-1" {...form.register('lastName')} />
                  {form.formState.errors.lastName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>}
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="companyName">Company name</Label>
                <Input id="companyName" placeholder="Acme Pvt Ltd" className="mt-1" {...form.register('companyName')} />
                {form.formState.errors.companyName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.companyName.message}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-1" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative mt-1">
                <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 digit" {...form.register('password')} />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Nashik" className="mt-1" {...form.register('city')} />
                {form.formState.errors.city && <p className="text-red-500 text-xs mt-1">{form.formState.errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <select id="state" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('state')}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {form.formState.errors.state && <p className="text-red-500 text-xs mt-1">{form.formState.errors.state.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600" disabled={isRegistering}>
              {isRegistering ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
