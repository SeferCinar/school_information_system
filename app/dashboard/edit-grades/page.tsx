"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import GradeEditForm from '@/components/GradeEditForm';

export default function EditGradesPage() {
  return (
    <RoleBasedRoute allowedRoles={['president']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <GradeEditForm />
      </div>
    </RoleBasedRoute>
  );
}
