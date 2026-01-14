"use client";

import { useEffect, useMemo, useState } from 'react';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import { getAllStudents } from '@/actions/studentActions';

type Student = {
  _id: string;
  student_no: string;
  name_surname: string;
  e_mail: string;
  department?: string;
  gpa?: number;
  state?: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) =>
      (s.name_surname || '').toLowerCase().includes(term) ||
      (s.student_no || '').toLowerCase().includes(term) ||
      (s.department || '').toLowerCase().includes(term)
    );
  }, [students, search]);

  return (
    <RoleBasedRoute allowedRoles={['instructor', 'president', 'staff']}>
      <div className="max-w-6xl mx-auto space-y-6 text-gray-900">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-600">Search and view student records</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            placeholder="Search by name, student no, or department..."
            className="flex-1 p-2 border border-gray-300 rounded text-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 border-b">Student No</th>
                <th className="py-3 px-4 border-b">Name</th>
                <th className="py-3 px-4 border-b">Department</th>
                <th className="py-3 px-4 border-b">GPA</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Email</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">No students found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{s.student_no}</td>
                    <td className="py-3 px-4">{s.name_surname}</td>
                    <td className="py-3 px-4">{s.department || '-'}</td>
                    <td className="py-3 px-4">{s.gpa ?? '-'}</td>
                    <td className="py-3 px-4">{s.state || '-'}</td>
                    <td className="py-3 px-4">{s.e_mail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleBasedRoute>
  );
}
