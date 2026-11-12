'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Scale, Lock, Mail, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid advocate email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LawyerLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isVerified, isLoading } = useLawyerAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isVerified) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, isVerified, router]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginFormData) => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      await login(values);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#172554] text-[#C49A45] shadow-sm mb-2">
            <Scale className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#172033]">LegalDost</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#FAF6ED] text-[#C49A45] border border-[#ECD9A7]">
              LAWYER
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Advocate Portal for Legal Matter Management & Verified Consultations
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
          {errorMessage && (
            <Toast
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Advocate Email"
              type="email"
              autoComplete="email"
              required
              placeholder="advocate@chambers.in"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={submitting}
              >
                Sign In to Advocate Workspace
              </Button>
            </div>
          </form>

          {/* New Practitioner Onboarding Link */}
          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            New legal practitioner?{' '}
            <Link href="/onboarding" className="font-semibold text-[#172554] hover:text-[#C49A45] underline">
              Apply for Bar Verification
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#94A3B8]">
          &copy; 2026 LegalDost Platform. Strictly for licensed and verified advocates.
        </p>
      </div>
    </div>
  );
}

