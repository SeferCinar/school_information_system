"use client";

import { useEffect, useState } from 'react';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';
import { getStudent } from '@/actions/studentActions';

type StudentDetails = {
  _id: string;
  student_no: string;
  name_surname: string;
  e_mail: string;
  department?: string;
  gpa?: number;
  state?: string;
};

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || user.role !== 'student') return;
      setLoadingDetails(true);
      try {
        const data = await getStudent(user.email);
        setStudentDetails(data);
      } catch (err) {
        console.error('Failed to load student details', err);
      } finally {
        setLoadingDetails(false);
      }
    };
    load();
  }, [user]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <RoleBasedRoute allowedRoles={['student', 'instructor', 'president', 'staff']}>
      <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600 mb-4">Your account information</p>

          {!user ? (
            <p className="text-red-600">No user session found.</p>
          ) : (
            <div className="space-y-2">
                            <div><span className="font-semibold">Name:</span> {user.name}</div>
              <div><span className="font-semibold">Email:</span> {user.email}</div>
              <div className="capitalize"><span className="font-semibold">Role:</span> {user.role}</div>
            </div>
          )}
        </div>

        {user?.role === 'student' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Student Details</h2>
            {loadingDetails && <div>Loading student details...</div>}
            {!loadingDetails && !studentDetails && (
              <div className="text-gray-600">No details found.</div>
            )}
            {studentDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">Student No:</span> {studentDetails.student_no}</div>
                <div><span className="font-semibold">Department:</span> {studentDetails.department || '-'}</div>
                <div><span className="font-semibold">GPA:</span> {studentDetails.gpa ?? '-'}</div>
                <div><span className="font-semibold">Status:</span> {studentDetails.state || '-'}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}
