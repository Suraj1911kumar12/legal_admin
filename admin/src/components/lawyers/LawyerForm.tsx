'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Lawyer } from '@/types/lawyer';
import { Toast } from '../ui/Toast';
import { useRouter } from 'next/navigation';

const practiceAreaOptions = [
  'Civil Litigation',
  'Criminal Law',
  'Corporate & Commercial Law',
  'Family & Matrimonial Law',
  'Property & Real Estate',
  'Taxation & GST',
  'Intellectual Property (IPR)',
  'Labour & Employment Law',
  'Banking & Finance',
  'Cyber Law & Data Privacy',
  'Consumer Disputes',
  'Constitutional Law'
];

const languageOptions = [
  'English',
  'Hindi',
  'Bengali',
  'Marathi',
  'Telugu',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Odia',
  'Malayalam',
  'Punjabi'
];

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const lawyerFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  phone: z.string().trim().regex(/^[+0-9\s-]{8,20}$/, 'Please enter a valid phone number'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  profileImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  barEnrollmentNumber: z.string().trim().min(3, 'Bar enrollment number is required'),
  barCouncil: z.string().trim().min(2, 'Bar council authority is required'),
  enrollmentState: z.string().trim().min(2, 'Enrollment state is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Experience cannot be negative').max(70, 'Invalid experience'),
  professionalBio: z.string().trim().max(2500).optional().or(z.literal('')),
  addressLine1: z.string().trim().min(3, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().min(4, 'Pincode must be at least 4 characters').max(10)
});

type LawyerFormData = z.infer<typeof lawyerFormSchema>;

interface LawyerFormProps {
  initialData?: Lawyer;
  onSubmit: (data: any) => Promise<any>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const LawyerForm: React.FC<LawyerFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false
}) => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  // Selected multi-select states
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>(
    initialData?.practiceAreas || ['Civil Litigation']
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialData?.languages || ['English', 'Hindi']
  );

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LawyerFormData>({
    resolver: zodResolver(lawyerFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      gender: initialData?.gender || undefined,
      profileImage: initialData?.profileImage || '',
      barEnrollmentNumber: initialData?.barEnrollmentNumber || '',
      barCouncil: initialData?.barCouncil || 'Bar Council of Delhi',
      enrollmentState: initialData?.enrollmentState || 'Delhi',
      yearsOfExperience: initialData?.yearsOfExperience ?? 5,
      professionalBio: initialData?.professionalBio || '',
      addressLine1: initialData?.officeAddress?.addressLine1 || '',
      addressLine2: initialData?.officeAddress?.addressLine2 || '',
      landmark: initialData?.officeAddress?.landmark || '',
      city: initialData?.city || '',
      state: initialData?.state || 'Delhi',
      pincode: initialData?.pincode || ''
    }
  });

  const togglePracticeArea = (area: string) => {
    if (selectedPracticeAreas.includes(area)) {
      if (selectedPracticeAreas.length > 1) {
        setSelectedPracticeAreas(selectedPracticeAreas.filter((a) => a !== area));
      }
    } else {
      setSelectedPracticeAreas([...selectedPracticeAreas, area]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const onFormSubmit = async (values: LawyerFormData) => {
    setErrorMsg('');

    if (selectedPracticeAreas.length === 0) {
      setErrorMsg('Please select at least one practice area.');
      return;
    }
    if (selectedLanguages.length === 0) {
      setErrorMsg('Please select at least one language.');
      return;
    }

    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      gender: values.gender,
      profileImage: values.profileImage || undefined,
      barEnrollmentNumber: values.barEnrollmentNumber.toUpperCase(),
      barCouncil: values.barCouncil,
      enrollmentState: values.enrollmentState,
      yearsOfExperience: values.yearsOfExperience,
      practiceAreas: selectedPracticeAreas,
      languages: selectedLanguages,
      professionalBio: values.professionalBio || undefined,
      officeAddress: {
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || undefined,
        landmark: values.landmark || undefined
      },
      city: values.city,
      state: values.state,
      pincode: values.pincode
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving lawyer details.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {errorMsg && <Toast type="error" message={errorMsg} />}

      {/* 1. Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>1. Basic Information</CardTitle>
          <CardDescription>Primary personal and contact credentials of the legal practitioner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Adv. Rajesh Kumar"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. rajesh.kumar@lawchambers.in"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              required
              placeholder="e.g. +91 98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label="Gender"
              placeholder="Select gender"
              error={errors.gender?.message}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' }
              ]}
              {...register('gender')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>2. Professional & Enrollment Details</CardTitle>
          <CardDescription>Bar council enrollment information and legal practice authority</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bar Enrollment Number"
              required
              placeholder="e.g. D/1234/2015"
              error={errors.barEnrollmentNumber?.message}
              {...register('barEnrollmentNumber')}
            />

            <Input
              label="Bar Council / Authority"
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
          </div>
        </CardContent>
      </Card>

      {/* 3. Practice Areas and Languages */}
      <Card>
        <CardHeader>
          <CardTitle>3. Practice Areas & Spoken Languages</CardTitle>
          <CardDescription>Select all areas of expertise and client consultation languages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-2">
              Practice Areas (Select at least one) <span className="text-[#DC2626]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {practiceAreaOptions.map((area) => {
                const isSelected = selectedPracticeAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => togglePracticeArea(area)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-[#172554] text-white border-[#172554] shadow-sm'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-2">
              Languages Spoken (Select at least one) <span className="text-[#DC2626]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-[#C49A45] text-white border-[#C49A45] shadow-sm'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Office Location */}
      <Card>
        <CardHeader>
          <CardTitle>4. Office Address & Location</CardTitle>
          <CardDescription>Chamber / office address for physical client consultations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Address Line 1"
            required
            placeholder="Chamber / Suite / Office Number and Street"
            error={errors.addressLine1?.message}
            {...register('addressLine1')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address Line 2 (Optional)"
              placeholder="Court Complex, Area, etc."
              error={errors.addressLine2?.message}
              {...register('addressLine2')}
            />

            <Input
              label="Landmark (Optional)"
              placeholder="Near Gate No., Metro station, etc."
              error={errors.landmark?.message}
              {...register('landmark')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              required
              placeholder="e.g. New Delhi"
              error={errors.city?.message}
              {...register('city')}
            />

            <Select
              label="State"
              required
              options={indianStates.map((s) => ({ value: s, label: s }))}
              error={errors.state?.message}
              {...register('state')}
            />

            <Input
              label="Pincode"
              required
              placeholder="e.g. 110001"
              error={errors.pincode?.message}
              {...register('pincode')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>5. Profile Details & Bio</CardTitle>
          <CardDescription>Professional summary and optional public headshot URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Profile Image URL (Optional)"
            placeholder="https://example.com/lawyer-headshot.jpg"
            error={errors.profileImage?.message}
            {...register('profileImage')}
          />

          <Textarea
            label="Professional Bio"
            rows={4}
            placeholder="Brief description of practice history, prominent trial experience, and areas of specialization..."
            error={errors.professionalBio?.message}
            {...register('professionalBio')}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEdit ? 'Save Changes' : 'Create Lawyer Profile'}
        </Button>
      </div>
    </form>
  );
};

