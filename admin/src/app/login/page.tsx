'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Scale, Lock, Mail, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

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
              ADMIN
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Authorized administrative access for lawyer credential verification & platform oversight
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
              label="Admin Email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@legaldost.com"
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
                Sign In to Admin Portal
              </Button>
            </div>
          </form>

          {/* Secure Environment Notice */}
          <div className="flex items-start gap-2 pt-4 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
            <ShieldAlert className="w-4 h-4 text-[#C49A45] shrink-0 mt-0.5" />
            <span>
              Restricted portal. All administrative access, verification decisions, and account modifications are strictly audited.
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#94A3B8]">
          &copy; 2026 LegalDost Platform. Confidential & Proprietary.
        </p>
      </div>
    </div>
  );
}

