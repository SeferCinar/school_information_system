"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';

export default function ManageCoursesPage() {
  return (
    <RoleBasedRoute allowedRoles={['president', 'instructor']}>
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Manage Courses</h1>
        <p className="text-gray-600">Only President and Instructors can see this page.</p>
        <div className="mt-4 p-4 border border-dashed border-gray-400 rounded">
          Course management content goes here...
        </div>
      </div>
    </RoleBasedRoute>
  );
}

