'use client';

import React, { useState, useEffect } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Scale,
  Award,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { lawyer, updateProfile, isUpdatingProfile } = useLawyerAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'prefer_not_to_say',
    languages: '',
    practiceAreas: '',
    yearsOfExperience: 0,
    professionalBio: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    consultationFee: 1500,
    consultationTypes: ['video', 'phone'] as string[],
    isAvailable: true
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (lawyer) {
      setFormData({
        fullName: lawyer.fullName || '',
        phone: lawyer.phone || '',
        gender: lawyer.gender || 'prefer_not_to_say',
        languages: Array.isArray(lawyer.languages) ? lawyer.languages.join(', ') : '',
        practiceAreas: Array.isArray(lawyer.practiceAreas) ? lawyer.practiceAreas.join(', ') : '',
        yearsOfExperience: lawyer.yearsOfExperience || 0,
        professionalBio: lawyer.professionalBio || '',
        addressLine1: lawyer.officeAddress?.addressLine1 || '',
        addressLine2: lawyer.officeAddress?.addressLine2 || '',
        landmark: lawyer.officeAddress?.landmark || '',
        city: lawyer.city || '',
        state: lawyer.state || '',
        pincode: lawyer.pincode || '',
        consultationFee: lawyer.consultationFee || 1500,
        consultationTypes: lawyer.consultationTypes || ['video', 'phone'],
        isAvailable: lawyer.isAvailable !== false
      });
    }
  }, [lawyer]);

  const handleCheckboxChange = (type: string) => {
    setFormData((prev) => {
      const exists = prev.consultationTypes.includes(type);
      return {
        ...prev,
        consultationTypes: exists
          ? prev.consultationTypes.filter((t) => t !== type)
          : [...prev.consultationTypes, type]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    try {
      const languages = formData.languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const practiceAreas = formData.practiceAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        languages,
        practiceAreas,
        yearsOfExperience: Number(formData.yearsOfExperience),
        professionalBio: formData.professionalBio,
        officeAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          landmark: formData.landmark
        },
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        consultationFee: Number(formData.consultationFee),
        consultationTypes: formData.consultationTypes,
        isAvailable: formData.isAvailable
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    }
  };

  if (!lawyer) {
    return (
      <LawyerShell>
        <div className="p-12 text-center text-sm text-slate-400">Loading advocate profile...</div>
      </LawyerShell>
    );
  }

  return (
    <LawyerShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Profile Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-2xl shadow-inner border border-gold-500/30">
              {lawyer.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{lawyer.fullName}</h1>
                {lawyer.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Advocate
                  </span>
                ) : (
                  <Badge variant="warning">{lawyer.verificationStatus}</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{lawyer.email}</span> • <span>{lawyer.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <div>
              <span className="block text-slate-400 text-[10px]">Enrollment</span>
              <span className="font-bold text-navy-900">{lawyer.barEnrollmentNumber}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="block text-slate-400 text-[10px]">Experience</span>
              <span className="font-bold text-navy-900">{lawyer.yearsOfExperience} Years</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="block text-slate-400 text-[10px]">Status</span>
              <span className="font-bold capitalize text-emerald-700">{lawyer.accountStatus}</span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated successfully.
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Verified Bar Identity (Read Only) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-600" />
                  Verified Bar Council Credentials (Protected)
                </CardTitle>
                <span className="text-[11px] text-slate-400">Locked for identity integrity</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">
                These credentials were authenticated against official State Bar Council gazettes. To request an update, contact LegalDost Bar Verification Desk.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Bar Enrollment Number"
                  value={lawyer.barEnrollmentNumber}
                  disabled
                  helperText="Official license number"
                />
                <Input
                  label="Bar Council Body"
                  value={lawyer.barCouncil}
                  disabled
                  helperText="Statutory Bar Council"
                />
                <Input
                  label="Enrollment State"
                  value={lawyer.enrollmentState}
                  disabled
                  helperText="State of admission"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: General & Practice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Scale className="w-4 h-4 text-navy-800" />
                Practice Details & Professional Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                  ]}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                  required
                />
              </div>

              <Input
                label="Practice Areas"
                value={formData.practiceAreas}
                onChange={(e) => setFormData({ ...formData, practiceAreas: e.target.value })}
                helperText="Comma-separated (e.g. Criminal Defense, Constitutional Law, Property Disputes)"
                required
              />

              <Input
                label="Languages Spoken"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                helperText="Comma-separated (e.g. English, Hindi, Punjabi, Bengali)"
                required
              />

              <Textarea
                label="Professional Bio"
                value={formData.professionalBio}
                onChange={(e) => setFormData({ ...formData, professionalBio: e.target.value })}
                placeholder="Describe your legal education, notable cases, judicial philosophy, and courtroom expertise..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Section 3: Office Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-navy-800" />
                Chamber / Office Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Chamber / Suite / Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                />
                <Input
                  label="Address Line 2 (Optional)"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
                <Input
                  label="Landmark (Optional)"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
                <Input
                  label="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Consultation Preferences & Fee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Consultation Terms & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Standard Consultation Fee (₹ INR)"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    helperText="Per 30-minute consultation slot"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Offered Consultation Modes
                  </label>
                  <div className="space-y-2 pt-1">
                    {[
                      { id: 'video', label: 'Video Call (Google Meet / WebRTC)' },
                      { id: 'phone', label: 'Phone Consultation' },
                      { id: 'in_person', label: 'In-Chamber In-Person Meeting' }
                    ].map((mode) => (
                      <label key={mode.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consultationTypes.includes(mode.id)}
                          onChange={() => handleCheckboxChange(mode.id)}
                          className="rounded text-navy-800 focus:ring-gold-500"
                        />
                        <span>{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accept New Clients</h4>
                  <p className="text-[11px] text-slate-500">
                    When active, your profile will appear for automated intake matching.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" isLoading={isUpdatingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </LawyerShell>
  );
}

