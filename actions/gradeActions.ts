'use server';

import { connectDB } from '@/lib/mongodb';
import Grade from '@/models/Grade';
import Exam from '@/models/Exam';
import Student from '@/models/Student';
import Lecture from '@/models/Lecture';
import { revalidatePath } from 'next/cache';

// Helper function to convert Mongoose Map to plain object
function convertExamScores(examScores: any): Record<string, number> {
  if (!examScores) return {};
  
  // If it's already a plain object
  if (examScores instanceof Map) {
    return Object.fromEntries(examScores);
  }
  
  // If it's a plain object
  if (typeof examScores === 'object' && examScores.constructor === Object) {
    return examScores;
  }
  
  // Try to convert if it has entries method
  if (examScores && typeof examScores === 'object' && 'entries' in examScores) {
    try {
      return Object.fromEntries(examScores.entries());
    } catch (e) {
      // Fallback: try Object.entries
      return Object.fromEntries(Object.entries(examScores));
    }
  }
  
  return {};
}

// Letter grade calculation based on weighted average
// Midterm 40% + Final 60% (or based on exam percentages)
export async function calculateLetterGrade(examScores: Record<string, number>, examPercentages: Record<string, number>): Promise<string> {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [examType, score] of Object.entries(examScores)) {
    const percentage = examPercentages[examType] || 0;
    totalWeightedScore += score * (percentage / 100);
    totalWeight += percentage / 100;
  }

  if (totalWeight === 0) return 'FF';

  const finalScore = totalWeightedScore / totalWeight;

  // Turkish grading system
  if (finalScore >= 90) return 'AA';
  if (finalScore >= 85) return 'BA';
  if (finalScore >= 80) return 'BB';
  if (finalScore >= 75) return 'CB';
  if (finalScore >= 70) return 'CC';
  if (finalScore >= 65) return 'DC';
  if (finalScore >= 60) return 'DD';
  return 'FF';
}

// GPA calculation (4.0 scale)
export async function calculateGPA(grades: Array<{ letter_grade: string; akts: number }>): Promise<number> {
  const gradePoints: Record<string, number> = {
    'AA': 4.0,
    'BA': 3.5,
    'BB': 3.0,
    'CB': 2.5,
    'CC': 2.0,
    'DC': 1.5,
    'DD': 1.0,
    'FF': 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  for (const grade of grades) {
    const points = gradePoints[grade.letter_grade] || 0;
    const credits = grade.akts || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

// Get grades for a specific course and semester
export async function getCourseGrades(lectureCode: string, semester: string) {
  await connectDB();
  const grades = await Grade.find({ lecture_code: lectureCode, semester }).lean();
  return grades.map((g: any) => ({
    ...g,
    _id: g._id.toString(),
    exam_scores: convertExamScores(g.exam_scores),
  }));
}

// Get all grades for a student
export async function getStudentGrades(studentNo: string) {
  await connectDB();
  const grades = await Grade.find({ student_no: studentNo })
    .sort({ semester: 1, lecture_code: 1 })
    .lean();
  
  return grades.map((g: any) => ({
    ...g,
    _id: g._id.toString(),
    exam_scores: convertExamScores(g.exam_scores),
  }));
}

// Save or update grades for a course
export async function saveGrades(params: {
  lectureCode: string;
  semester: string;
  grades: Array<{
    student_no: string;
    exam_scores: Record<string, number>; // exam_type -> score
  }>;
  enteredBy: string;
}) {
  await connectDB();

  const { lectureCode, semester, grades, enteredBy } = params;

  if (!lectureCode || !semester) {
    return { success: false, error: 'Lecture code and semester are required.' };
  }

  // Get exam percentages for this course
  const exams = await Exam.find({ lecture_code: lectureCode, semester }).lean();
  const examPercentages: Record<string, number> = {};
  exams.forEach((exam: any) => {
    examPercentages[exam.exam_type] = exam.percentage;
  });

  try {
    const results = [];

    for (const gradeData of grades) {
      const { student_no, exam_scores } = gradeData;

      // Validate exam scores
      for (const [examType, score] of Object.entries(exam_scores)) {
        if (!Number.isFinite(score) || score < 0 || score > 100) {
          return { success: false, error: `Invalid score for ${examType}. Must be between 0-100.` };
        }
      }

      // Calculate letter grade
      const letterGrade = await calculateLetterGrade(exam_scores, examPercentages);

      // Upsert grade
      const grade = await Grade.findOneAndUpdate(
        { student_no, lecture_code: lectureCode, semester },
        {
          $set: {
            student_no,
            lecture_code: lectureCode,
            semester,
            exam_scores: new Map(Object.entries(exam_scores)),
            letter_grade: letterGrade,
            entered_by: enteredBy,
            updated_by: enteredBy,
            updated_at: new Date(),
          },
          $setOnInsert: {
            entered_at: new Date(),
          },
        },
        { upsert: true, new: true }
      ).lean();

      // Update student's lecture_catalog if grade is passing (DD or better)
      if (letterGrade !== 'FF') {
        await Student.updateOne(
          { student_no },
          { $addToSet: { lecture_catalog: lectureCode } }
        );
      }

      // Recalculate and update student GPA
      const studentGrades = await Grade.find({ student_no }).lean();
      const courseCodes = studentGrades.map((g: any) => g.lecture_code);
      const courses = await Lecture.find({ code: { $in: courseCodes } }).lean();
      const courseMap = new Map(courses.map((c: any) => [c.code, c]));

      const gradesWithCredits = studentGrades
        .filter((g: any) => g.letter_grade && g.letter_grade !== 'FF')
        .map((g: any) => ({
          letter_grade: g.letter_grade,
          akts: courseMap.get(g.lecture_code)?.akts || 0,
        }));

      const newGPA = await calculateGPA(gradesWithCredits);
      await Student.updateOne({ student_no }, { $set: { gpa: newGPA } });

      results.push({
        student_no,
        letter_grade: letterGrade,
        _id: grade._id.toString(),
      });
    }

    revalidatePath('/dashboard/grades');
    return { success: true, data: results };
  } catch (error: any) {
    console.error('Save grades error:', error);
    return { success: false, error: 'Failed to save grades.' };
  }
}

// Update a single grade (for Head Lecturer override)
export async function updateGrade(params: {
  gradeId: string;
  exam_scores?: Record<string, number>;
  letter_grade?: string;
  updatedBy: string;
}) {
  await connectDB();

  const { gradeId, exam_scores, letter_grade, updatedBy } = params;

  try {
    const grade = await Grade.findById(gradeId).lean();
    if (!grade) {
      return { success: false, error: 'Grade not found.' };
    }

    const updateObj: any = {
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    // If exam_scores provided, recalculate letter grade
    if (exam_scores) {
      const exams = await Exam.find({
        lecture_code: grade.lecture_code,
        semester: grade.semester,
      }).lean();

      const examPercentages: Record<string, number> = {};
      exams.forEach((exam: any) => {
        examPercentages[exam.exam_type] = exam.percentage;
      });

      updateObj.exam_scores = new Map(Object.entries(exam_scores));
      updateObj.letter_grade = await calculateLetterGrade(exam_scores, examPercentages);
    } else if (letter_grade) {
      updateObj.letter_grade = letter_grade;
    }

    const updated = await Grade.findByIdAndUpdate(gradeId, { $set: updateObj }, { new: true }).lean();

    // Recalculate student GPA
    const studentGrades = await Grade.find({ student_no: grade.student_no }).lean();
    const courseCodes = studentGrades.map((g: any) => g.lecture_code);
    const courses = await Lecture.find({ code: { $in: courseCodes } }).lean();
    const courseMap = new Map(courses.map((c: any) => [c.code, c]));

    const gradesWithCredits = studentGrades
      .filter((g: any) => g.letter_grade && g.letter_grade !== 'FF')
      .map((g: any) => ({
        letter_grade: g.letter_grade,
        akts: courseMap.get(g.lecture_code)?.akts || 0,
      }));

    const newGPA = calculateGPA(gradesWithCredits);
    await Student.updateOne({ student_no: grade.student_no }, { $set: { gpa: newGPA } });

    revalidatePath('/dashboard/grades');
    return { success: true, data: { ...updated, _id: updated._id.toString() } };
  } catch (error: any) {
    console.error('Update grade error:', error);
    return { success: false, error: 'Failed to update grade.' };
  }
}

// Get enrolled students for a course
export async function getEnrolledStudents(lectureCode: string, semester: string) {
  await connectDB();
  const Enrolment = (await import('@/models/Enrolment')).default;
  
  const enrolments = await Enrolment.find({ lecture_code: lectureCode, semester }).lean();
  const studentNos = enrolments.map((e: any) => e.student_no);
  
  if (studentNos.length === 0) return [];
  
  const students = await Student.find({ student_no: { $in: studentNos } }).lean();
  return students.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
  }));
}
