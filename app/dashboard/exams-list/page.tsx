"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import ExamList from '@/components/ExamList';

export default function ExamsListPage() {
  return (
    <RoleBasedRoute allowedRoles={['student', 'instructor', 'president']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <ExamList />
      </div>
    </RoleBasedRoute>
  );
}
