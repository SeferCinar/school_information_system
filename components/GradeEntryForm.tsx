'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCourses } from '@/actions/courseActions';
import { getEnrolledStudents, getCourseGrades, saveGrades } from '@/actions/gradeActions';
import { getExams } from '@/actions/examActions';

type Course = {
  _id: string;
  code: string;
  name: string;
  semester?: string;
  lecturer?: string;
};

type Student = {
  _id: string;
  student_no: string;
  name_surname: string;
};

type Exam = {
  _id: string;
  exam_type: string;
  percentage: number;
};

type GradeData = {
  student_no: string;
  exam_scores: Record<string, string>; // exam_type -> score (as string for input)
};

export default function GradeEntryForm() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [existingGrades, setExistingGrades] = useState<Record<string, any>>({});
  const [grades, setGrades] = useState<Record<string, GradeData>>({});
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!courseCode) return;
    const c = courses.find((x) => x.code === courseCode);
    if (c?.semester) setSemester(c.semester);
  }, [courseCode, courses]);

  useEffect(() => {
    const loadData = async () => {
      if (!courseCode || !semester) {
        setStudents([]);
        setExams([]);
        setGrades({});
        setExistingGrades({});
        return;
      }

      setLoading(true);
      setMessage('');
      try {
        const [studentList, examList, gradeList] = await Promise.all([
          getEnrolledStudents(courseCode, semester),
          getExams(courseCode, semester),
          getCourseGrades(courseCode, semester),
        ]);

        setStudents(studentList as Student[]);
        setExams(examList as Exam[]);

        // Initialize grades object
        const gradesMap: Record<string, GradeData> = {};
        const existingMap: Record<string, any> = {};

        studentList.forEach((student: any) => {
          const existing = gradeList.find((g: any) => g.student_no === student.student_no);
          if (existing) {
            existingMap[student.student_no] = existing;
            const examScores: Record<string, string> = {};
            examList.forEach((exam: any) => {
              const score = existing.exam_scores?.[exam.exam_type];
              examScores[exam.exam_type] = score !== undefined ? String(score) : '';
            });
            gradesMap[student.student_no] = {
              student_no: student.student_no,
              exam_scores: examScores,
            };
          } else {
            const examScores: Record<string, string> = {};
            examList.forEach((exam: any) => {
              examScores[exam.exam_type] = '';
            });
            gradesMap[student.student_no] = {
              student_no: student.student_no,
              exam_scores: examScores,
            };
          }
        });

        setGrades(gradesMap);
        setExistingGrades(existingMap);
      } catch (e) {
        console.error(e);
        setMessage('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseCode, semester]);

  const updateGrade = (studentNo: string, examType: string, value: string) => {
    setMessage('');
    setGrades((prev) => ({
      ...prev,
      [studentNo]: {
        ...prev[studentNo],
        exam_scores: {
          ...prev[studentNo]?.exam_scores,
          [examType]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!user || !courseCode || !semester) return;

    setSaving(true);
    setMessage('');

    try {
      // Convert grades to proper format
      const gradesToSave = Object.values(grades).map((gradeData) => ({
        student_no: gradeData.student_no,
        exam_scores: Object.fromEntries(
          Object.entries(gradeData.exam_scores).map(([examType, score]) => [
            examType,
            score.trim() === '' ? 0 : Number(score),
          ])
        ),
      }));

      // Filter out students with no scores entered
      const gradesWithScores = gradesToSave.filter((g) =>
        Object.values(g.exam_scores).some((score) => score > 0)
      );

      if (gradesWithScores.length === 0) {
        setMessage('Please enter at least one grade.');
        setSaving(false);
        return;
      }

      const res = await saveGrades({
        lectureCode: courseCode,
        semester,
        grades: gradesWithScores,
        enteredBy: user.ref_id,
      });

      if (res.success) {
        setMessage('Grades saved successfully!');
        // Reload data
        const gradeList = await getCourseGrades(courseCode, semester);
        const existingMap: Record<string, any> = {};
        gradeList.forEach((g: any) => {
          existingMap[g.student_no] = g;
        });
        setExistingGrades(existingMap);
      } else {
        setMessage(res.error || 'Failed to save grades.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to save grades.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Grade Entry</h2>
        <p className="text-gray-600">Enter exam scores for students enrolled in your courses.</p>
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

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading students and exams...</div>
      ) : courseCode && semester && students.length > 0 ? (
        <>
          {exams.length === 0 ? (
            <div className="text-yellow-600 bg-yellow-50 p-4 rounded border border-yellow-200">
              No exams defined for this course. Please create exams first.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
                      <th className="py-2 px-4 border">Student No</th>
                      <th className="py-2 px-4 border">Name</th>
                      {exams.map((exam) => (
                        <th key={exam._id} className="py-2 px-4 border">
                          {exam.exam_type} ({exam.percentage}%)
                        </th>
                      ))}
                      <th className="py-2 px-4 border">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const studentGrade = grades[student.student_no];
                      const existing = existingGrades[student.student_no];
                      return (
                        <tr key={student._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 border font-medium">{student.student_no}</td>
                          <td className="py-2 px-4 border">{student.name_surname}</td>
                          {exams.map((exam) => (
                            <td key={exam._id} className="py-2 px-4 border">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-20 p-1 border rounded border-gray-300 text-gray-900"
                                placeholder="0-100"
                                value={studentGrade?.exam_scores[exam.exam_type] || ''}
                                onChange={(e) => updateGrade(student.student_no, exam.exam_type, e.target.value)}
                                disabled={saving}
                              />
                            </td>
                          ))}
                          <td className="py-2 px-4 border font-semibold">
                            {existing?.letter_grade || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Grades'}
                </button>
              </div>
            </>
          )}
        </>
      ) : courseCode && semester ? (
        <div className="text-gray-600 py-4">No students enrolled in this course for this semester.</div>
      ) : null}
    </div>
  );
}
