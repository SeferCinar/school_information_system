"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import CourseList from '@/components/CourseList';
import AddCourseForm from '@/components/AddCourseForm';

export default function ManageCoursesPage() {
  return (
    <RoleBasedRoute allowedRoles={['president', 'instructor']}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
          <p className="text-gray-600">View and manage course offerings.</p>
        </div>
        
        <CourseList />
        
        <div className="border-t pt-8">
           <AddCourseForm />
        </div>
      </div>
    </RoleBasedRoute>
  );
}
