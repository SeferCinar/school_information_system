'use server'

import { connectDB } from '@/lib/mongodb_ts';
import Student from '@/models/Student';
import Lecture from '@/models/Lecture';
import Enrolment from '@/models/Enrolment';
import { revalidatePath } from 'next/cache';

export async function getStudent(email: string) {
  await connectDB();
  // Using email to find student as auth usually provides email
  const student = await Student.findOne({ e_mail: email }).lean();
  if (student) {
    student._id = student._id.toString();
  }
  return student;
}

export async function enrollStudent(studentId: string, courseCodes: string[]) {
  await connectDB();
  
  const student = await Student.findById(studentId);
  if (!student) return { success: false, error: "Student not found" };

  // Filter out courses already enrolled
  const newCoursesToEnroll = courseCodes.filter(code => !student.enrolledCourses.includes(code));
  
  if (newCoursesToEnroll.length === 0) {
      return { success: false, error: "No new courses to enroll." };
  }

  const courses = await Lecture.find({ code: { $in: newCoursesToEnroll } });
  
  // 1. Credit Check
  // Get credits of ALREADY enrolled
  const enrolledLectures = await Lecture.find({ code: { $in: student.enrolledCourses } });
  const enrolledCredits = enrolledLectures.reduce((sum: number, c: any) => sum + c.akts, 0);
  
  // Get credits of NEW courses
  const newCredits = courses.reduce((sum: number, c: any) => sum + c.akts, 0);

  if (enrolledCredits + newCredits > 45) {
    return { success: false, error: `Total ECTS (${enrolledCredits + newCredits}) exceeds 45 limit.` };
  }

  // 2. Prerequisite Check
  const passedCourses = student.lecture_catalog || [];
  for (const course of courses) {
    if (course.prerequisites && course.prerequisites.length > 0) {
      const missing = course.prerequisites.filter((p: string) => !passedCourses.includes(p));
      if (missing.length > 0) {
        return { success: false, error: `Cannot enroll in ${course.name}. Missing prerequisites: ${missing.join(', ')}` };
      }
    }
  }

  // 3. Quota Check
  for (const course of courses) {
    const count = await Enrolment.countDocuments({ lecture_code: course.code, semester: course.semester });
    if (count >= course.quota) {
      return { success: false, error: `Course ${course.name} is full (Quota: ${course.quota}).` };
    }
  }

  // Execute Enrollment
  try {
    // Update Student
    student.enrolledCourses.push(...newCoursesToEnroll);
    await student.save();

    // Create Enrolment Records
    for (const course of courses) {
        await Enrolment.create({
            student_no: student.student_no,
            lecture_code: course.code,
            semester: course.semester
        });
    }

    revalidatePath('/dashboard/course-selection');
    return { success: true, message: "Successfully enrolled." };

  } catch (error: any) {
    console.error("Enrollment Error:", error);
    return { success: false, error: "Enrollment failed. Please try again." };
  }
}

