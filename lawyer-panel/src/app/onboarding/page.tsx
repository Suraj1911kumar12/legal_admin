'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { VerificationBadge } from '@/components/ui/Badge';
import { Scale, ShieldCheck, Clock, XCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().trim().regex(/^[+0-9\s-]{8,20}$/, 'Valid phone number is required'),
  barEnrollmentNumber: z.string().trim().min(3, 'Bar enrollment number is required').toUpperCase(),
  barCouncil: z.string().trim().min(2, 'Bar council authority is required'),
  enrollmentState: z.string().trim().min(2, 'State is required'),
  yearsOfExperience: z.coerce.number().min(0).max(70),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().min(4).max(10)
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { lawyer, isAuthenticated, isVerified, register: registerLawyer, isRegistering } = useLawyerAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      barCouncil: 'Bar Council of Delhi',
      enrollmentState: 'Delhi',
      state: 'Delhi',
      yearsOfExperience: 5
    }
  });

  const onSubmit = async (values: RegisterFormData) => {
    setErrorMessage('');
    try {
      await registerLawyer({
        ...values,
        languages: ['English', 'Hindi'],
        practiceAreas: ['Civil Litigation', 'Corporate Law'],
        officeAddress: { addressLine1: values.city }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    }
  };

  // If already authenticated, show the credential verification status tracker
  if (isAuthenticated && lawyer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#172554] text-[#C49A45] shadow-sm mb-2">
              <Scale className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#172033]">Bar Credential Verification</h2>
            <p className="text-xs text-[#64748B]">LegalDost Administrative Admission Standing</p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-sm font-semibold text-[#172033]">{lawyer.fullName}</span>
                <p className="text-xs text-[#64748B]">{lawyer.email}</p>
              </div>
              <VerificationBadge status={lawyer.verificationStatus} />
            </div>

            {/* Application Progress Flow */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Verification Stages</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl border border-[#BBF7D0] bg-[#ECFDF5] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#15803D] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1. Submitted</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">Advocate credentials entered into registry</p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-3.5 rounded-xl border space-y-1 ${
                    lawyer.verificationStatus === 'under_review' || lawyer.verificationStatus === 'verified'
                      ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>2. In Review</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">Bar Council license roster check</p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-3.5 rounded-xl border space-y-1 ${
                    lawyer.verificationStatus === 'verified'
                      ? 'border-[#BBF7D0] bg-[#ECFDF5] text-[#15803D]'
                      : lawyer.verificationStatus === 'rejected'
                      ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {lawyer.verificationStatus === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-[#DC2626]" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>3. Authorized</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">Full portal & query intake access</p>
                </div>
              </div>
            </div>

            {/* Current Status Explanations */}
            {lawyer.verificationStatus === 'pending' && (
              <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#7C5B23] space-y-1">
                <span className="font-bold">Application Received:</span>
                <p>
                  Your registration is pending review by the LegalDost admin team. Once your Bar Council license
                  (<span className="font-mono font-semibold">{lawyer.barEnrollmentNumber}</span>) is checked, you will receive full query intake access.
                </p>
              </div>
            )}

            {lawyer.verificationStatus === 'under_review' && (
              <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E3A8A] space-y-1">
                <span className="font-bold">Active Review in Progress:</span>
                <p>
                  An administrator has marked your profile as under review. We are currently validating your enrollment
                  with the {lawyer.barCouncil}.
                </p>
              </div>
            )}

            {lawyer.verificationStatus === 'rejected' && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626] space-y-1">
                <span className="font-bold">Application Verification Rejected:</span>
                <p className="text-sm font-medium mt-1">Reason: {lawyer.rejectionReason || 'Documents did not meet compliance criteria.'}</p>
                <p className="text-[11px] text-[#475569] pt-2">
                  Please review your profile details or contact LegalDost administrator support to request re-examination.
                </p>
              </div>
            )}

            {lawyer.verificationStatus === 'verified' && (
              <div className="p-4 bg-[#ECFDF5] border border-[#BBF7D0] rounded-xl text-xs text-[#15803D] space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-sm">Congratulations! You are a Verified LegalDost Advocate</span>
                  <p>Your license is active and you can now accept incoming customer queries, manage matters, and hold consultations.</p>
                </div>
                <Link href="/dashboard">
                  <Button variant="success" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Enter Lawyer Workspace
                  </Button>
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <Link href="/profile" className="font-medium text-[#172554] hover:underline">
                View Profile Details
              </Link>
              <Link href="/login" className="hover:underline">
                Switch Account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If not logged in, show the practitioner onboarding application form
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#172554] text-[#C49A45] shadow-sm mb-2">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#172033]">Practitioner Application</h2>
          <p className="text-xs text-[#64748B]">
            Submit your legal bar license credentials to become an authorized LegalDost advocate
          </p>
        </div>

        <Card className="p-8 space-y-6">
          {errorMessage && <Toast type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Advocate Full Name"
                required
                placeholder="e.g. Adv. Priya Sharma"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="priya@chambers.in"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Account Password"
                type="password"
                required
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Phone Number"
                required
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Bar Enrollment Number"
                required
                placeholder="e.g. D/4567/2018"
                error={errors.barEnrollmentNumber?.message}
                {...register('barEnrollmentNumber')}
              />

              <Input
                label="Bar Council Authority"
                required
                placeholder="e.g. Bar Council of Delhi"
                error={errors.barCouncil?.message}
                {...register('barCouncil')}
              />

              <Select
                label="Enrollment State"
                required
                options={indianStates.map((s) => ({ value: s, label: s }))}
                error={errors.enrollmentState?.message}
                {...register('enrollmentState')}
              />

              <Input
                label="Years of Experience"
                type="number"
                required
                min={0}
                max={70}
                error={errors.yearsOfExperience?.message}
                {...register('yearsOfExperience')}
              />

              <Input
                label="Primary City"
                required
                placeholder="New Delhi"
                error={errors.city?.message}
                {...register('city')}
              />

              <Input
                label="Pincode"
                required
                placeholder="110001"
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isRegistering}>
                Submit Application for Verification
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-[#64748B]">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-[#172554] hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

