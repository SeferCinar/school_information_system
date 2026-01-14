"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import ScheduleView from '@/components/ScheduleView';

export default function SchedulePage() {
  return (
    <RoleBasedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <ScheduleView />
      </div>
    </RoleBasedRoute>
  );
}
