'use client';

import RoleBasedRoute from '@/components/RoleBasedRoute';
import StudentCourseSelection from '@/components/StudentCourseSelection';

export default function CourseSelectionPage() {
  return (
    <RoleBasedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Selection</h1>
          <p className="text-gray-600">Browse available courses and manage your enrollment.</p>
        </div>
        <StudentCourseSelection />
      </div>
    </RoleBasedRoute>
  );
}

