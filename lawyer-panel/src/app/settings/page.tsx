'use client';

import React, { useState, useEffect } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import {
  Settings,
  Bell,
  Lock,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const { lawyer, updateProfile, isUpdatingProfile } = useLawyerAuth();

  const [isAvailable, setIsAvailable] = useState(true);
  const [consultationFee, setConsultationFee] = useState(1500);
  const [notifyQueries, setNotifyQueries] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyConsultations, setNotifyConsultations] = useState(true);

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (lawyer) {
      setIsAvailable(lawyer.isAvailable !== false);
      setConsultationFee(lawyer.consultationFee || 1500);
    }
  }, [lawyer]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(false);
    try {
      await updateProfile({
        isAvailable,
        consultationFee: Number(consultationFee)
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LawyerShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account & Practice Settings</h1>
          <p className="text-sm text-slate-500">
            Configure consultation availability, communication channels, and account security.
          </p>
        </div>

        {savedStatus && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Preferences updated successfully.
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Availability & Practice Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy-800" />
                Intake Availability & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Active Intake Status</h4>
                  <p className="text-[11px] text-slate-500">
                    When toggled on, LegalDost matches incoming citizen legal requests to your practice areas.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="max-w-xs">
                <Input
                  label="Default Consultation Fee (₹ INR)"
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  helperText="Default slot charge for legal appointments"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold-600" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">New Query Direct Alerts</h5>
                  <p className="text-[11px] text-slate-500">
                    Receive instant in-app alerts when a new matching query arrives in your queue.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyQueries}
                  onChange={(e) => setNotifyQueries(e.target.checked)}
                  className="rounded text-navy-800 focus:ring-gold-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Client Messages</h5>
                  <p className="text-[11px] text-slate-500">
                    Get alerted whenever a client replies or uploads a new case document.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMessages}
                  onChange={(e) => setNotifyMessages(e.target.checked)}
                  className="rounded text-navy-800 focus:ring-gold-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Consultation Bookings</h5>
                  <p className="text-[11px] text-slate-500">
                    Alerts for scheduled appointments and reminder notifications 15 minutes before calls.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyConsultations}
                  onChange={(e) => setNotifyConsultations(e.target.checked)}
                  className="rounded text-navy-800 focus:ring-gold-500 h-4 w-4"
                />
              </label>
            </CardContent>
          </Card>

          {/* Security & Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-navy-800" />
                Security & Advocate Privilege
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">Registered Advocate Account</span>
                  <span className="text-slate-500">{lawyer?.email}</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px]">
                  Protected by HttpOnly JWT
                </span>
              </div>

              <div className="p-3.5 bg-navy-50/60 rounded-xl border border-navy-100 text-xs text-navy-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Shield className="w-4 h-4 text-gold-600" />
                  Privileged Legal Communication Guarantee
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All messages, evidentiary uploads, and private counsel notes stored on LegalDost are guarded under end-to-end access isolation standards in accordance with the Advocates Act, 1961.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="md" isLoading={isUpdatingProfile}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </LawyerShell>
  );
}

