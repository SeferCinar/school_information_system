'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/actions/courseActions';
import { getStudent } from '@/actions/studentActions';
import { useAuth } from '@/context/AuthContext';

export default function CourseListEnroled() {
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // For students, fetch their record to get enrolledCourses
        if (user.role === 'student' && user.email) {
          const studentData = await getStudent(user.email);
          setStudent(studentData);
        }

        // Load all courses once; we filter client-side for enrolled ones
        const coursesData = await getCourses();
        setAllCourses(coursesData);
      } catch (error) {
        console.error('Failed to load enrolled courses', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter to only courses that belong to this user (enrolled or taught)
  const userCourses = allCourses.filter((course) => {
    if (!user) return false;

    // Student: courses where code is in student's enrolledCourses
    if (user.role === 'student') {
      return student?.enrolledCourses?.includes(course.code);
    }

    // Instructor/President: courses they teach (by lecturer name)
    if (user.role === 'instructor' || user.role === 'president') {
      return course.lecturer && course.lecturer === user.name;
    }

    // Staff: currently no specific enrolment logic
    return false;
  });

  // Apply search (by name or code) and semester filter
  const filteredCourses = userCourses.filter((course) => {
    const matchesSearch =
      search.trim() === '' ||
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase());

    const matchesSemester =
      semester === '' || course.semester === semester;

    return matchesSearch && matchesSemester;
  });

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
        <p className="text-center">Please log in to view your courses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {user.role === 'student' ? 'My Enrolled Courses' : 'My Courses'}
      </h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          className="p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Empty spacer to keep layout similar to 3-column grid */}
        <div />
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
              <th className="py-2 px-4 border">Semester</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 border-b">
                  <td className="py-2 px-4 border">{course.code}</td>
                  <td className="py-2 px-4 border">{course.name}</td>
                  <td className="py-2 px-4 border">{course.department}</td>
                  <td className="py-2 px-4 border">{course.akts}</td>
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


