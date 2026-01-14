'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStudent } from '@/actions/studentActions';
import { getStudentGrades, calculateGPA } from '@/actions/gradeActions';
import { getCourses } from '@/actions/courseActions';

type Grade = {
  _id: string;
  lecture_code: string;
  semester: string;
  exam_scores: Record<string, number>;
  letter_grade: string;
  entered_at?: string;
};

type SemesterGrades = {
  semester: string;
  courses: Array<{
    code: string;
    name: string;
    akts: number;
    letter_grade: string;
    exam_scores: Record<string, number>;
  }>;
};

function SemesterGPA({ courses }: { courses: SemesterGrades['courses'] }) {
  const [gpa, setGPA] = useState(0);

  useEffect(() => {
    const compute = async () => {
      const gpaValue = await calculateGPA(courses.map((c) => ({ letter_grade: c.letter_grade, akts: c.akts })));
      setGPA(gpaValue);
    };
    compute();
  }, [courses]);

  return <>{gpa.toFixed(2)}</>;
}

export default function TranscriptView() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
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
          const studentGrades = await getStudentGrades(studentData.student_no);
          setGrades(studentGrades as Grade[]);
        }
        setCourses(coursesData || []);
      } catch (e) {
        console.error('Failed to load transcript:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const semesterGrades = useMemo(() => {
    if (!student || grades.length === 0) return [];

    const courseMap = new Map(courses.map((c: any) => [c.code, c]));
    const grouped: Record<string, SemesterGrades['courses']> = {};

    grades.forEach((grade) => {
      const course = courseMap.get(grade.lecture_code);
      if (!course) return;

      if (!grouped[grade.semester]) {
        grouped[grade.semester] = [];
      }

      grouped[grade.semester].push({
        code: grade.lecture_code,
        name: course.name,
        akts: course.akts || 0,
        letter_grade: grade.letter_grade || 'FF',
        exam_scores: grade.exam_scores || {},
      });
    });

    return Object.entries(grouped)
      .map(([semester, courses]) => ({ semester, courses }))
      .sort((a, b) => {
        const order: Record<string, number> = { Fall: 1, Spring: 2, Summer: 3 };
        return (order[a.semester] || 0) - (order[b.semester] || 0);
      });
  }, [grades, courses, student]);

  const [overallGPA, setOverallGPA] = useState(0);

  useEffect(() => {
    const computeGPA = async () => {
      if (!student || semesterGrades.length === 0) {
        setOverallGPA(student?.gpa || 0);
        return;
      }

      const allGrades = semesterGrades.flatMap((sg) =>
        sg.courses.map((c) => ({
          letter_grade: c.letter_grade,
          akts: c.akts,
        }))
      );

      const gpa = await calculateGPA(allGrades);
      setOverallGPA(gpa);
    };
    computeGPA();
  }, [semesterGrades, student]);

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
        <h2 className="text-2xl font-bold text-gray-800">Academic Transcript</h2>
        <p className="text-gray-600">Your complete academic record</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading transcript...</div>
      ) : !student ? (
        <div className="text-center py-8 text-gray-600">Student record not found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Student Number</p>
              <p className="font-semibold text-gray-900">{student.student_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{student.name_surname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall GPA</p>
              <p className="font-bold text-lg text-blue-700">{overallGPA.toFixed(2)}</p>
            </div>
          </div>

          {semesterGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No grades recorded yet.</div>
          ) : (
            <div className="space-y-6">
              {semesterGrades.map((semesterData) => (
                <div key={semesterData.semester} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">{semesterData.semester} Semester</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Course Code</th>
                          <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Course Name</th>
                          <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">ECTS</th>
                          <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Letter Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterData.courses.map((course) => (
                          <tr key={course.code} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 font-medium">{course.code}</td>
                            <td className="py-2 px-4">{course.name}</td>
                            <td className="py-2 px-4">{course.akts}</td>
                            <td className="py-2 px-4 font-semibold">{course.letter_grade}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="py-2 px-4 font-semibold text-right">Semester GPA:</td>
                          <td className="py-2 px-4"></td>
                          <td className="py-2 px-4 font-bold">
                            <SemesterGPA courses={semesterData.courses} />
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
