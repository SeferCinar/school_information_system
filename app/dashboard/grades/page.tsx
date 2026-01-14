"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import GradeEntryForm from '@/components/GradeEntryForm';

export default function GradesPage() {
  return (
    <RoleBasedRoute allowedRoles={['instructor', 'president']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <GradeEntryForm />
      </div>
    </RoleBasedRoute>
  );
}
