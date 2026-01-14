'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStudent } from '@/actions/studentActions';
import { getCourses } from '@/actions/courseActions';

type Course = {
  code: string;
  name: string;
  time?: string; // e.g., "Mon 10:00-12:00"
  semester?: string;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

export default function ScheduleView() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [studentData, coursesData] = await Promise.all([
          getStudent(user.email),
          getCourses(),
        ]);

        if (studentData) {
          setStudent(studentData);
        }
        setAllCourses(coursesData || []);
      } catch (e) {
        console.error('Failed to load schedule:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const enrolledCourses = useMemo(() => {
    if (!student?.enrolledCourses) return [];
    return allCourses.filter((c: any) => student.enrolledCourses.includes(c.code));
  }, [student, allCourses]);

  const parseTime = (timeStr?: string): { day: string; startHour: number; endHour: number } | null => {
    if (!timeStr) return null;
    
    // Parse formats like "Mon 10:00-12:00" or "Monday 10:00-12:00"
    const dayMap: Record<string, string> = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
    };

    const parts = timeStr.split(' ');
    if (parts.length < 2) return null;

    const day = dayMap[parts[0]] || parts[0];
    const timeRange = parts[1];
    const [start, end] = timeRange.split('-');

    if (!start || !end) return null;

    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);

    if (!Number.isFinite(startHour) || !Number.isFinite(endHour)) return null;

    return { day, startHour, endHour };
  };

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<number, Course[]>> = {};
    
    DAYS.forEach(day => {
      grid[day] = {};
      HOURS.forEach(hour => {
        grid[day][hour] = [];
      });
    });

    enrolledCourses.forEach((course: any) => {
      const timeInfo = parseTime(course.time);
      if (!timeInfo) return;

      const { day, startHour, endHour } = timeInfo;
      if (!grid[day]) return;

      for (let hour = startHour; hour < endHour; hour++) {
        if (grid[day][hour]) {
          grid[day][hour].push(course);
        }
      }
    });

    return grid;
  }, [enrolledCourses]);

  if (!user || user.role !== 'student') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
        <p className="text-center">This page is only accessible to students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Weekly Schedule</h2>
        <p className="text-gray-600">Your course schedule for the current semester</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading schedule...</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No courses enrolled. Please select courses first.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left text-sm font-semibold text-gray-700 w-24">Time</th>
                {DAYS.map(day => (
                  <th key={day} className="py-2 px-4 border text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-b">
                  <td className="py-2 px-4 border text-sm font-medium text-gray-700 bg-gray-50">
                    {String(hour).padStart(2, '0')}:00
                  </td>
                  {DAYS.map(day => {
                    const courses = scheduleGrid[day]?.[hour] || [];
                    return (
                      <td key={day} className="py-2 px-4 border align-top">
                        {courses.map((course: any) => (
                          <div
                            key={course.code}
                            className="mb-1 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-gray-900"
                          >
                            <div className="font-semibold">{course.code}</div>
                            <div className="text-gray-600">{course.name}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
