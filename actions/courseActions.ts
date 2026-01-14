'use server'

import { connectDB } from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import { revalidatePath } from 'next/cache';

export async function getCourses(query: string = '', department: string = '', semester: string = '') {
  await connectDB();
  
  const matchStage: any = {};
  if (query) {
    matchStage.$or = [
      { name: { $regex: query, $options: 'i' } },
      { code: { $regex: query, $options: 'i' } }
    ];
  }
  if (department) matchStage.department = department;
  if (semester) matchStage.semester = semester;

  // Use aggregation to get enrollment count efficiently
  const courses = await Lecture.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'Enrolment',
        let: { l_code: '$code', l_sem: '$semester' },
        pipeline: [
          { $match: 
             { $expr: 
                { $and: [
                   { $eq: ['$lecture_code', '$$l_code'] },
                   // Match semester if course has semester defined, otherwise match any or handle logic?
                   // Assuming enrolment is strictly per semester and course offering
                   { $eq: ['$semester', '$$l_sem'] }
                ]}
             }
          }
        ],
        as: 'enrolments'
      }
    },
    {
      $addFields: {
        enrolledCount: { $size: '$enrolments' },
        // Convert _id to string for serialization
        _id: { $toString: '$_id' }
      }
    },
    {
       $project: { enrolments: 0 }
    }
  ]);

  return courses;
}

export async function addCourse(formData: any) {
  await connectDB();

  try {
    // Basic validation could go here
    // Ensure _id is present. If not, maybe use code?
    if (!formData._id && formData.code) {
        formData._id = formData.code;
    }

    const newCourse = new Lecture(formData);
    await newCourse.save();
    
    revalidatePath('/dashboard/manage-courses');
    return { success: true };
  } catch (error: any) {
    console.error("Add Course Error:", error);
    return { success: false, error: error.message };
  }
}

