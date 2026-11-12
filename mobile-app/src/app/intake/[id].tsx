import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { IntakeWorkflowView } from '@/features/intake/IntakeWorkflowView';

export default function ResumeIntakeDraftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <IntakeWorkflowView draftId={id} />;
}

