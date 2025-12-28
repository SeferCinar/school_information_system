'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/actions/courseActions';

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses(search, department, semester);
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounce);
  }, [search, department, semester]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Course List</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          className="p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Industrial Engineering">Industrial Engineering</option>
        </select>
        <select
          className="p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          <option value="Fall">Fall</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="py-2 px-4 border">Code</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Department</th>
              <th className="py-2 px-4 border">ECTS</th>
              <th className="py-2 px-4 border">Quota</th>
              <th className="py-2 px-4 border">Semester</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4">No courses found.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 border-b">
                  <td className="py-2 px-4 border">{course.code}</td>
                  <td className="py-2 px-4 border">{course.name}</td>
                  <td className="py-2 px-4 border">{course.department}</td>
                  <td className="py-2 px-4 border">{course.akts}</td>
                  <td className="py-2 px-4 border">{course.quota}</td>
                  <td className="py-2 px-4 border">{course.semester}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

