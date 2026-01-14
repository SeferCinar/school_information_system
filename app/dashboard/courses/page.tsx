"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import CourseListEnroled from '@/components/CourseListEnroled';

export default function ManageCoursesPage() {
  return (
    <RoleBasedRoute allowedRoles={['student', 'instructor']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">List Courses</h1>
          <p className="text-gray-600">View your enroled courses</p>
        </div>
        
        <CourseListEnroled />
      </div>
    </RoleBasedRoute>
  );
}
