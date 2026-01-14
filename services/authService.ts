"use server";

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Role } from "@/types";

export const loginUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    // 1. Connect to SIS_DB explicitly
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SIS_DB';
    
    // Clear any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect with explicit options
    await mongoose.connect(MONGODB_URI, {
      dbName: 'SIS_DB',
      serverSelectionTimeoutMS: 5000
    });

    // 2. Get database reference
    const db = mongoose.connection.db;
    if (!db) {
      return null;
    }

    // 3. Get User collection
    const userCollection = db.collection('User');

    // 4. Search for the specific user
    // Try exact match first
    let user = await userCollection.findOne({ email: email });
    
    if (!user) {
      // Try case-insensitive
      user = await userCollection.findOne({
        email: { $regex: `^${email}$`, $options: 'i' }
      });
    }
    
    if (!user) {
      // Try trimmed
      user = await userCollection.findOne({ email: email.trim() });
    }

    if (!user) {
      return null;
    }

    // 5. Check if password exists
    if (!user.password) {
      return null;
    }

    // 6. Validate password
    // Check hash format
    const hashParts = user.password.split('$');
    if (hashParts.length !== 4) {
      return null;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    // 7. Get user's name from related collection
    let name = "User";
    
    if (user.role === 'student') {
      const studentCollection = db.collection('Student');
      const student = await studentCollection.findOne({ _id: user.ref_id });
      if (student) {
        name = student.name_surname || "Student";
      }
    } else if (user.role === 'instructor' || user.role === 'president' || user.role === 'lecturer') {
      // Some databases might store teaching staff as 'lecturer' instead of 'instructor'
      const lecturerCollection = db.collection('Lecturer');
      const lecturer = await lecturerCollection.findOne({ _id: user.ref_id });
      name = lecturer?.name_surname || "Lecturer";
    } else if (user.role === 'staff') {
      const staffCollection = db.collection('StaffMember');
      const staff = await staffCollection.findOne({ _id: user.ref_id });
      name = staff?.name_surname || "Staff";
    }

    // 8. Normalize role to app Role union and create user object
    const rawRole = (user.role || '').toString().toLowerCase();
    let mappedRole: Role;
    switch (rawRole) {
      case 'student':
      case 'instructor':
      case 'president':
      case 'staff':
        mappedRole = rawRole as Role;
        break;
      case 'lecturer':
        // Treat 'lecturer' from DB as 'instructor' in the app
        mappedRole = 'instructor';
        break;
      default:
        // Fallback to staff so user still has minimal access instead of breaking
        mappedRole = 'staff';
        break;
    }

    const userObj: User = {
      id: user._id.toString(),
      email: user.email,
      name: name,
      role: mappedRole,
      ref_id: user.ref_id
    };

    return userObj;

  } catch (error: any) {
    console.error("Login error:", error.message);
    return null;
  }
};