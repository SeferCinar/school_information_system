"use client";

import RoleBasedRoute from '@/components/RoleBasedRoute';
import ProfileUpdateForm from '@/components/ProfileUpdateForm';

export default function ProfileUpdatePage() {
  return (
    <RoleBasedRoute allowedRoles={['staff']}>
      <div className="max-w-3xl mx-auto space-y-8">
        <ProfileUpdateForm />
      </div>
    </RoleBasedRoute>
  );
}
