"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import TranscriptView from '@/components/TranscriptView';

export default function TranscriptPage() {
  return (
    <RoleBasedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <TranscriptView />
      </div>
    </RoleBasedRoute>
  );
}
