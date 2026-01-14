'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserExams } from '@/actions/examActions';

type ExamWithCourse = {
  _id: string;
  course_code: string;
  course_name: string;
  exam_type: string;
  percentage: number;
  exam_date: string; // YYYY-MM-DD
  time?: string; // HH:MM (optional for backward compatibility)
  duration?: number; // minutes (optional for backward compatibility)
};

export default function ExamList() {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadExams = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const examList = await getUserExams(
          user.role,
          user.email,
          user.name
        );
        setExams(examList as ExamWithCourse[]);
      } catch (e) {
        console.error('Failed to load exams:', e);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, [user]);

  const filteredExams = exams.filter((exam) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      exam.course_code.toLowerCase().includes(searchLower) ||
      exam.course_name.toLowerCase().includes(searchLower) ||
      exam.exam_type.toLowerCase().includes(searchLower)
    );
  });

  const calculateEndTime = (startTime: string | undefined, duration: number | undefined): string => {
    if (!startTime || !duration) return '-';
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) return '-';
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    } catch (e) {
      return '-';
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
        <p className="text-center">Please log in to view your exams.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800">My Exams</h2>
        <p className="text-gray-600 text-sm">
          {user.role === 'student' 
            ? 'View exams for your enrolled courses.' 
            : 'View exams for courses you teach.'}
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by course code, name, or exam type..."
          className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading exams...</div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          {exams.length === 0 
            ? 'No exams found for your courses.' 
            : 'No exams match your search.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-2 px-4 border">Course Code</th>
                <th className="py-2 px-4 border">Course Name</th>
                <th className="py-2 px-4 border">Exam Type</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Start Time</th>
                <th className="py-2 px-4 border">End Time</th>
                <th className="py-2 px-4 border">Percentage</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredExams.map((exam) => {
                const endTime = calculateEndTime(exam.time, exam.duration);
                return (
                  <tr key={exam._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 border font-medium">{exam.course_code}</td>
                    <td className="py-2 px-4 border">{exam.course_name}</td>
                    <td className="py-2 px-4 border">{exam.exam_type}</td>
                    <td className="py-2 px-4 border">
                      {exam.exam_date 
                        ? new Date(exam.exam_date + 'T00:00:00').toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="py-2 px-4 border">{exam.time || '-'}</td>
                    <td className="py-2 px-4 border">{endTime}</td>
                    <td className="py-2 px-4 border">{exam.percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
