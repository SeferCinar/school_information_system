'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCourses } from '@/actions/courseActions';
import { getExams, createExam, updateExam, deleteExam, getTotalPercentage } from '@/actions/examActions';

type Course = {
  _id: string;
  code: string;
  name: string;
  semester?: string;
  lecturer?: string;
};

type Exam = {
  _id: string;
  exam_type: string;
  percentage: number;
  exam_date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
};

export default function ExamCreationForm() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('');

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const [newExamType, setNewExamType] = useState('');
  const [newExamPercentage, setNewExamPercentage] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamTime, setNewExamTime] = useState('');
  const [newExamDuration, setNewExamDuration] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;
      setLoadingCourses(true);
      try {
        const all = await getCourses();
        const mine = (all || []).filter((c: any) => c?.lecturer && c.lecturer === user.name);
        setCourses(mine);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [user]);

  // Auto-set semester based on selected course
  useEffect(() => {
    if (!courseCode) return;
    const c = courses.find((x) => x.code === courseCode);
    if (c?.semester) setSemester(c.semester);
  }, [courseCode, courses]);

  // Load existing exams when course/semester changes
  useEffect(() => {
    const loadExams = async () => {
      setMessage('');
      if (!courseCode || !semester) {
        setExams([]);
        setTotalPercentage(0);
        return;
      }
      setLoadingExams(true);
      try {
        const examList = await getExams(courseCode, semester);
        setExams(examList as Exam[]);
        const total = await getTotalPercentage(courseCode, semester);
        setTotalPercentage(total);
      } catch (e) {
        console.error(e);
        setMessage('Failed to load exams.');
      } finally {
        setLoadingExams(false);
      }
    };
    loadExams();
  }, [courseCode, semester]);

  const handleCreateExam = async () => {
    if (!user || !courseCode || !semester) return;

    const examType = newExamType.trim();
    const percentage = Number(newExamPercentage);
    const duration = Number(newExamDuration);

    if (!examType) {
      setMessage('Exam type is required.');
      return;
    }
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      setMessage('Percentage must be between 1 and 100.');
      return;
    }
    if (!newExamDate) {
      setMessage('Exam date is required.');
      return;
    }
    if (!newExamTime || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(newExamTime)) {
      setMessage('Valid start time is required (HH:MM format).');
      return;
    }
    if (!Number.isFinite(duration) || duration < 1) {
      setMessage('Duration must be at least 1 minute.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await createExam({
        lectureCode: courseCode,
        semester,
        examType,
        percentage,
        examDate: newExamDate,
        time: newExamTime,
        duration,
        lecturerId: user.ref_id,
        lecturerName: user.name,
      });

      if (res.success) {
        setMessage('Exam created successfully.');
        setNewExamType('');
        setNewExamPercentage('');
        setNewExamDate('');
        setNewExamTime('');
        setNewExamDuration('');
        // Reload exams
        const examList = await getExams(courseCode, semester);
        setExams(examList as Exam[]);
        const total = await getTotalPercentage(courseCode, semester);
        setTotalPercentage(total);
      } else {
        setMessage(res.error || 'Failed to create exam.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to create exam.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!courseCode || !semester) return;
    if (!confirm('Are you sure you want to delete this exam?')) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await deleteExam(examId);
      if (res.success) {
        setMessage('Exam deleted successfully.');
        // Reload exams
        const examList = await getExams(courseCode, semester);
        setExams(examList as Exam[]);
        const total = await getTotalPercentage(courseCode, semester);
        setTotalPercentage(total);
      } else {
        setMessage(res.error || 'Failed to delete exam.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to delete exam.');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Exam Management</h2>
        <p className="text-gray-600">Create and manage exams for your courses. Set exam type, percentage, and date.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
          <select
            className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            disabled={loadingCourses}
          >
            <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
            {courses.map((c) => (
              <option key={c._id} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          {!loadingCourses && courses.length === 0 && (
            <div className="text-xs text-red-600 mt-1">
              No courses found for lecturer "{user?.name}". Check `Lecture.lecturer` values.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
          <select
            className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            disabled={!courseCode}
          >
            <option value="">Select semester</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>

      {courseCode && semester && (
        <>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Existing Exams</h3>
              <div className="text-sm">
                <span className="font-semibold">Total Percentage: </span>
                <span className={totalPercentage > 100 ? 'text-red-700 font-bold' : 'text-gray-700 font-bold'}>
                  {totalPercentage}%
                </span>
                {totalPercentage > 100 && (
                  <span className="text-red-600 ml-2">(exceeds 100%)</span>
                )}
              </div>
            </div>

            {loadingExams ? (
              <div className="text-gray-600 py-4">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="text-gray-600 py-4">No exams created yet for this course and semester.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
                      <th className="py-2 px-4 border">Exam Type</th>
                      <th className="py-2 px-4 border">Percentage</th>
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Start Time</th>
                      <th className="py-2 px-4 border">Duration</th>
                      <th className="py-2 px-4 border">End Time</th>
                      <th className="py-2 px-4 border w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => {
                      // Calculate end time
                      const [hours, minutes] = exam.time.split(':').map(Number);
                      const startMinutes = hours * 60 + minutes;
                      const endMinutes = startMinutes + exam.duration;
                      const endHours = Math.floor(endMinutes / 60) % 24;
                      const endMins = endMinutes % 60;
                      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                      
                      return (
                        <tr key={exam._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 border">{exam.exam_type}</td>
                          <td className="py-2 px-4 border">{exam.percentage}%</td>
                          <td className="py-2 px-4 border">
                            {exam.exam_date ? new Date(exam.exam_date + 'T00:00:00').toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2 px-4 border">{exam.time || '-'}</td>
                          <td className="py-2 px-4 border">{exam.duration} min</td>
                          <td className="py-2 px-4 border">{endTime}</td>
                          <td className="py-2 px-4 border">
                            <button
                              onClick={() => handleDeleteExam(exam._id)}
                              className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Exam</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Type</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
                  placeholder="e.g. Midterm, Final, Quiz"
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Percentage</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
                  placeholder="0-100"
                  value={newExamPercentage}
                  onChange={(e) => setNewExamPercentage(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
                  min={today}
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
                  value={newExamTime}
                  onChange={(e) => setNewExamTime(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
                  placeholder="e.g. 90"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateExam}
                disabled={saving || !newExamType || !newExamPercentage || !newExamDate || !newExamTime || !newExamDuration}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded border text-sm ${
              message.includes('success') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
