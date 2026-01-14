'use server';

import { connectDB } from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function getExams(lectureCode: string, semester: string) {
  await connectDB();
  const exams = await Exam.find({ lecture_code: lectureCode, semester })
    .sort({ exam_date: 1, time: 1 })
    .lean();
  return exams.map((e: any) => ({
    ...e,
    _id: e._id.toString(),
    exam_date: e.exam_date ? new Date(e.exam_date).toISOString().split('T')[0] : null,
    time: e.time || '',
    duration: e.duration || 0,
  }));
}

export async function createExam(params: {
  lectureCode: string;
  semester: string;
  examType: string;
  percentage: number;
  examDate: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM format
  duration: number; // Duration in minutes
  lecturerId?: string;
  lecturerName?: string;
}) {
  await connectDB();

  const lectureCode = (params.lectureCode || '').trim();
  const semester = (params.semester || '').trim();
  const examType = (params.examType || '').trim();
  const percentage = Number(params.percentage);
  const examDate = params.examDate ? new Date(params.examDate) : null;
  const time = (params.time || '').trim();
  const duration = Number(params.duration);

  if (!lectureCode) return { success: false, error: 'Lecture code is required.' };
  if (!semester) return { success: false, error: 'Semester is required.' };
  if (!examType) return { success: false, error: 'Exam type is required.' };
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return { success: false, error: 'Percentage must be between 0 and 100.' };
  }
  if (!examDate || isNaN(examDate.getTime())) {
    return { success: false, error: 'Valid exam date is required.' };
  }
  if (!time || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return { success: false, error: 'Valid time is required (HH:MM format).' };
  }
  if (!Number.isFinite(duration) || duration < 1) {
    return { success: false, error: 'Duration must be at least 1 minute.' };
  }

  try {
    const exam = await Exam.create({
      lecture_code: lectureCode,
      semester,
      exam_type: examType,
      percentage,
      exam_date: examDate,
      time,
      duration,
      lecturer_id: params.lecturerId,
      lecturer_name: params.lecturerName,
    });

    return { success: true, data: { ...exam.toObject(), _id: exam._id.toString() } };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: 'An exam of this type already exists for this course and semester.' };
    }
    console.error('Create exam error:', error);
    return { success: false, error: 'Failed to create exam.' };
  }
}

export async function updateExam(
  examId: string,
  updates: {
    examType?: string;
    percentage?: number;
    examDate?: string;
    time?: string;
    duration?: number;
  }
) {
  await connectDB();

  const examType = updates.examType?.trim();
  const percentage = updates.percentage !== undefined ? Number(updates.percentage) : undefined;
  const examDate = updates.examDate ? new Date(updates.examDate) : undefined;
  const time = updates.time?.trim();
  const duration = updates.duration !== undefined ? Number(updates.duration) : undefined;

  if (examType !== undefined && examType.length === 0) {
    return { success: false, error: 'Exam type cannot be empty.' };
  }
  if (percentage !== undefined && (!Number.isFinite(percentage) || percentage < 0 || percentage > 100)) {
    return { success: false, error: 'Percentage must be between 0 and 100.' };
  }
  if (examDate !== undefined && (isNaN(examDate.getTime()))) {
    return { success: false, error: 'Valid exam date is required.' };
  }
  if (time !== undefined && (!time || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time))) {
    return { success: false, error: 'Valid time is required (HH:MM format).' };
  }
  if (duration !== undefined && (!Number.isFinite(duration) || duration < 1)) {
    return { success: false, error: 'Duration must be at least 1 minute.' };
  }

  const updateObj: any = {};
  if (examType !== undefined) updateObj.exam_type = examType;
  if (percentage !== undefined) updateObj.percentage = percentage;
  if (examDate !== undefined) updateObj.exam_date = examDate;
  if (time !== undefined) updateObj.time = time;
  if (duration !== undefined) updateObj.duration = duration;

  try {
    const updated = await Exam.findByIdAndUpdate(examId, { $set: updateObj }, { new: true }).lean();
    if (!updated) {
      return { success: false, error: 'Exam not found.' };
    }
    return { success: true, data: { ...updated, _id: updated._id.toString() } };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: 'An exam of this type already exists for this course and semester.' };
    }
    console.error('Update exam error:', error);
    return { success: false, error: 'Failed to update exam.' };
  }
}

export async function deleteExam(examId: string) {
  await connectDB();
  try {
    const deleted = await Exam.findByIdAndDelete(examId);
    if (!deleted) {
      return { success: false, error: 'Exam not found.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Delete exam error:', error);
    return { success: false, error: 'Failed to delete exam.' };
  }
}

export async function getTotalPercentage(lectureCode: string, semester: string) {
  await connectDB();
  const result = await Exam.aggregate([
    { $match: { lecture_code: lectureCode, semester } },
    { $group: { _id: null, total: { $sum: '$percentage' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
}

// Get exams for a student (based on enrolled courses) or lecturer (based on taught courses)
export async function getUserExams(userRole: string, userEmail?: string, lecturerName?: string) {
  await connectDB();
  
  const Lecture = (await import('@/models/Lecture')).default;
  const Student = (await import('@/models/Student')).default;
  
  let courseCodes: string[] = [];
  
  if (userRole === 'student' && userEmail) {
    const student = await Student.findOne({ e_mail: userEmail }).lean();
    if (student && student.enrolledCourses) {
      courseCodes = student.enrolledCourses;
    }
  } else if ((userRole === 'instructor' || userRole === 'president') && lecturerName) {
    const courses = await Lecture.find({ lecturer: lecturerName }).lean();
    courseCodes = courses.map((c: any) => c.code);
  }
  
  if (courseCodes.length === 0) {
    return [];
  }
  
  const exams = await Exam.find({ lecture_code: { $in: courseCodes } })
    .sort({ exam_date: 1, time: 1 })
    .lean();
  
  // Get course details for each exam
  const courseDetails = await Lecture.find({ code: { $in: courseCodes } }).lean();
  const courseMap = new Map(courseDetails.map((c: any) => [c.code, c]));
  
  return exams.map((exam: any) => {
    const course = courseMap.get(exam.lecture_code);
    return {
      ...exam,
      _id: exam._id.toString(),
      course_code: exam.lecture_code,
      course_name: course?.name || 'Unknown Course',
      exam_date: exam.exam_date ? new Date(exam.exam_date).toISOString().split('T')[0] : null,
      time: exam.time || null,
      duration: exam.duration || null,
    };
  });
}
