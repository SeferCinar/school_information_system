"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import ExamCreationForm from '@/components/ExamCreationForm';

export default function ExamsPage() {
  return (
    <RoleBasedRoute allowedRoles={['instructor', 'president']}>
      <div className="max-w-5xl mx-auto space-y-6">
        <ExamCreationForm />
      </div>
    </RoleBasedRoute>
  );
}

