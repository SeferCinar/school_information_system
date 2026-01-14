'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllStudents } from '@/actions/studentActions';
import { getStudentGrades, updateGrade } from '@/actions/gradeActions';
import { getCourses } from '@/actions/courseActions';

type Student = {
  _id: string;
  student_no: string;
  name_surname: string;
};

type Grade = {
  _id: string;
  lecture_code: string;
  semester: string;
  exam_scores: Record<string, number>;
  letter_grade: string;
};

export default function GradeEditForm() {
  const { user } = useAuth();
  const [selectedStudentNo, setSelectedStudentNo] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<Record<string, string>>({});
  const [editLetterGrade, setEditLetterGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [studentList, coursesData] = await Promise.all([
          getAllStudents(),
          getCourses(),
        ]);
        setStudents(studentList || []);
        setCourses(coursesData || []);
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedStudentNo) {
        setGrades([]);
        return;
      }
      setLoading(true);
      try {
        const gradesData = await getStudentGrades(selectedStudentNo);
        setGrades(gradesData as Grade[]);
      } catch (e) {
        console.error('Failed to load grades:', e);
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, [selectedStudentNo]);

  const handleEdit = (grade: Grade) => {
    setEditingGradeId(grade._id);
    setEditScores(Object.fromEntries(
      Object.entries(grade.exam_scores || {}).map(([k, v]) => [k, String(v)])
    ));
    setEditLetterGrade(grade.letter_grade || '');
    setMessage('');
  };

  const handleCancel = () => {
    setEditingGradeId(null);
    setEditScores({});
    setEditLetterGrade('');
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingGradeId || !user) return;

    setSaving(true);
    setMessage('');

    try {
      const examScores: Record<string, number> = {};
      for (const [key, value] of Object.entries(editScores)) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue) || numValue < 0 || numValue > 100) {
          setMessage(`Invalid score for ${key}. Must be between 0-100.`);
          setSaving(false);
          return;
        }
        examScores[key] = numValue;
      }

      const res = await updateGrade({
        gradeId: editingGradeId,
        exam_scores: Object.keys(examScores).length > 0 ? examScores : undefined,
        letter_grade: editLetterGrade || undefined,
        updatedBy: user.ref_id,
      });

      if (res.success) {
        setMessage('Grade updated successfully!');
        handleCancel();
        // Reload grades
        const gradesData = await getStudentGrades(selectedStudentNo);
        setGrades(gradesData as Grade[]);
      } else {
        setMessage(res.error || 'Failed to update grade.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to update grade.');
    } finally {
      setSaving(false);
    }
  };

  const courseMap = new Map(courses.map((c: any) => [c.code, c]));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Edit Student Grades</h2>
        <p className="text-gray-600">Override grades for any student (Head Lecturer only)</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Student</label>
        <select
          className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
          value={selectedStudentNo}
          onChange={(e) => setSelectedStudentNo(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a student</option>
          {students.map((s) => (
            <option key={s._id} value={s.student_no}>
              {s.student_no} - {s.name_surname}
            </option>
          ))}
        </select>
      </div>

      {selectedStudentNo && (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading grades...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No grades found for this student.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="py-2 px-4 border">Course Code</th>
                    <th className="py-2 px-4 border">Course Name</th>
                    <th className="py-2 px-4 border">Semester</th>
                    <th className="py-2 px-4 border">Exam Scores</th>
                    <th className="py-2 px-4 border">Letter Grade</th>
                    <th className="py-2 px-4 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => {
                    const course = courseMap.get(grade.lecture_code);
                    const isEditing = editingGradeId === grade._id;

                    return (
                      <tr key={grade._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 border font-medium">{grade.lecture_code}</td>
                        <td className="py-2 px-4 border">{course?.name || 'Unknown'}</td>
                        <td className="py-2 px-4 border">{grade.semester}</td>
                        <td className="py-2 px-4 border">
                          {isEditing ? (
                            <div className="space-y-1">
                              {Object.entries(grade.exam_scores || {}).map(([examType]) => (
                                <div key={examType} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 w-20">{examType}:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-20 p-1 border rounded text-gray-900 text-sm"
                                    value={editScores[examType] || ''}
                                    onChange={(e) =>
                                      setEditScores({ ...editScores, [examType]: e.target.value })
                                    }
                                    disabled={saving}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm">
                              {Object.entries(grade.exam_scores || {}).map(([examType, score]) => (
                                <div key={examType}>
                                  {examType}: {score}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-4 border">
                          {isEditing ? (
                            <select
                              className="p-1 border rounded text-gray-900 text-sm"
                              value={editLetterGrade}
                              onChange={(e) => setEditLetterGrade(e.target.value)}
                              disabled={saving}
                            >
                              <option value="">Select grade</option>
                              <option value="AA">AA</option>
                              <option value="BA">BA</option>
                              <option value="BB">BB</option>
                              <option value="CB">CB</option>
                              <option value="CC">CC</option>
                              <option value="DC">DC</option>
                              <option value="DD">DD</option>
                              <option value="FF">FF</option>
                            </select>
                          ) : (
                            <span className="font-semibold">{grade.letter_grade || '-'}</span>
                          )}
                        </td>
                        <td className="py-2 px-4 border">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm disabled:bg-gray-400"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(grade)}
                              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

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
