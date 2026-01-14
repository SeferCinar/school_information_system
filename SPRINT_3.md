# Sprint 3 - Development Log

## Overview
This document tracks all changes and features implemented during Sprint 3 development sessions.

---

## Session 1: Course List and Exam System Foundation

### Changes Made

#### 1. CourseListEnroled Component Enhancement
- **File**: `components/CourseListEnroled.tsx`
- **Changes**:
  - Refactored to show only enrolled courses for students and taught courses for lecturers
  - Added search functionality by course name or course code
  - Added semester filter (Fall, Spring, Summer)
  - Integrated with `useAuth` to get current user
  - For students: Filters courses based on `enrolledCourses` array
  - For lecturers: Filters courses where `lecturer === user.name`

#### 2. Removed Add Course Form from Courses Page
- **File**: `app/dashboard/courses/page.tsx`
- **Changes**:
  - Removed `AddCourseForm` import and component rendering
  - Page now only displays enrolled courses list

#### 3. Fixed Lecturer Sidebar Menu Visibility
- **File**: `services/authService.ts`
- **Changes**:
  - Added role normalization: Maps database role "lecturer" to application role "instructor"
  - Updated name lookup logic to handle "lecturer" role
  - Ensures lecturers can see sidebar menu items properly

#### 4. Profile Page Implementation
- **File**: `app/dashboard/profile/page.tsx`
- **Features**:
  - Displays user basic information (name, email, role)
  - For students: Shows additional details (student number, department, GPA, status)
  - Fetches student data using `getStudent` action
  - Accessible to all roles (student, instructor, president, staff)

#### 5. Students List Page Implementation
- **File**: `app/dashboard/students/page.tsx`
- **Features**:
  - Lists all students in the system
  - Search functionality by name, student number, or department
  - Displays: Student Number, Name, Department, GPA, Status, Email
  - Accessible to instructors, presidents, and staff
  - Uses new `getAllStudents()` server action

#### 6. Server Action: getAllStudents
- **File**: `actions/studentActions.ts`
- **Changes**:
  - Added `getAllStudents()` function to fetch all students from database
  - Returns students with stringified `_id` for client-side use

---

## Session 2: Exam Management System

### Changes Made

#### 1. Exam Model Creation
- **File**: `models/Exam.ts`
- **Schema Fields**:
  - `lecture_code`: String (required, indexed, ref: 'Lecture')
  - `semester`: String (required)
  - `exam_type`: String (required) - e.g., 'Midterm', 'Final', 'Quiz', 'Homework'
  - `percentage`: Number (required, min: 0, max: 100)
  - `exam_date`: Date (required)
  - `time`: String (required) - Start time in HH:MM format
  - `duration`: Number (required, min: 1) - Duration in minutes
  - `lecturer_id`: String - User ref_id
  - `lecturer_name`: String - User name for display
- **Indexes**: Unique constraint on `lecture_code + semester + exam_type`

#### 2. Exam Server Actions
- **File**: `actions/examActions.ts`
- **Functions Created**:
  - `getExams(lectureCode, semester)`: Get all exams for a specific course and semester
  - `createExam(params)`: Create a new exam with validation
  - `updateExam(examId, updates)`: Update exam details
  - `deleteExam(examId)`: Delete an exam
  - `getTotalPercentage(lectureCode, semester)`: Calculate total percentage for a course
  - `getUserExams(userRole, userEmail, lecturerName)`: Get exams for students (enrolled courses) or lecturers (taught courses)
- **Validation**:
  - Time format validation (HH:MM)
  - Duration must be at least 1 minute
  - Percentage must be between 0-100
  - Unique exam type per course/semester

#### 3. Exam Creation Form Component
- **File**: `components/ExamCreationForm.tsx`
- **Features**:
  - Course selection (only lecturer's own courses)
  - Semester selection
  - Create new exam with:
    - Exam Type (text input)
    - Percentage (1-100)
    - Exam Date (date picker)
    - Start Time (time picker)
    - Duration (minutes)
  - Display existing exams in table format
  - Shows total percentage (warns if > 100%)
  - Delete exam functionality
  - Calculates and displays end time (start time + duration)
- **Access**: Instructors and Presidents only

#### 4. Exam List Component
- **File**: `components/ExamList.tsx`
- **Features**:
  - Displays exams for students (enrolled courses) or lecturers (taught courses)
  - Shows: Course Code, Course Name, Exam Type, Date, Start Time, End Time, Percentage
  - Search functionality by course code, name, or exam type
  - Calculates end time from start time + duration
  - Handles missing time/duration gracefully (backward compatibility)
- **Access**: Students, Instructors, and Presidents

#### 5. Exam List Page
- **File**: `app/dashboard/exams-list/page.tsx`
- **Features**:
  - Page wrapper for ExamList component
  - Role-based access control

#### 6. Sidebar Menu Update
- **File**: `components/Sidebar.tsx`
- **Changes**:
  - Added "My Exams" menu item
  - Accessible to: students, instructors, presidents
  - Links to `/dashboard/exams-list`

#### 7. Bug Fixes
- **File**: `components/ExamList.tsx`, `actions/examActions.ts`
- **Fixes**:
  - Added null checks for `time` and `duration` fields (backward compatibility with old exams)
  - Made `time` and `duration` optional in TypeScript types
  - Updated `calculateEndTime` function with proper error handling
  - Ensured `getUserExams` always returns `time` and `duration` fields (even if null)

---

## Technical Details

### Database Models
- **Exam**: New model for storing exam information with time and duration
- **Student**: Used for fetching enrolled courses
- **Lecture**: Used for course information and lecturer matching

### Authentication & Authorization
- Role normalization: "lecturer" → "instructor"
- Role-based route protection maintained
- User context used throughout components

### UI/UX Improvements
- Consistent styling with Tailwind CSS
- Loading states for async operations
- Error messages and validation feedback
- Search and filter capabilities
- Responsive table layouts

---

## Files Created
1. `models/Exam.ts`
2. `components/ExamCreationForm.tsx`
3. `components/ExamList.tsx`
4. `app/dashboard/exams-list/page.tsx`
5. `app/dashboard/profile/page.tsx`
6. `app/dashboard/students/page.tsx`

## Files Modified
1. `components/CourseListEnroled.tsx`
2. `app/dashboard/courses/page.tsx`
3. `services/authService.ts`
4. `actions/studentActions.ts`
5. `actions/examActions.ts` (new file)
6. `components/Sidebar.tsx`

## Files Deleted
1. `models/ExamScheme.ts` (replaced with Exam model)

---

---

## Session 3: Grade Management and Academic Assessment System

### Changes Made

#### 1. Grade Model Creation
- **File**: `models/Grade.ts`
- **Schema Fields**:
  - `student_no`: String (required, indexed, ref: 'Student')
  - `lecture_code`: String (required, indexed, ref: 'Lecture')
  - `semester`: String (required)
  - `exam_scores`: Map<String, Number> - exam_type -> score (0-100)
  - `letter_grade`: String - AA, BA, BB, CB, CC, DC, DD, FF
  - `entered_by`: String - lecturer_id or user.ref_id
  - `entered_at`: Date - Timestamp when grade was first entered
  - `updated_at`: Date - Timestamp when grade was last updated
  - `updated_by`: String - For tracking who last updated
- **Indexes**: Unique constraint on `student_no + lecture_code + semester`

#### 2. Grade Server Actions
- **File**: `actions/gradeActions.ts`
- **Functions Created**:
  - `calculateLetterGrade(examScores, examPercentages)`: Calculates letter grade based on weighted exam scores
    - Supports flexible exam percentages (not just 40/60)
    - Turkish grading system: AA (≥90), BA (≥85), BB (≥80), CB (≥75), CC (≥70), DC (≥65), DD (≥60), FF (<60)
  - `calculateGPA(grades)`: Calculates GPA on 4.0 scale
    - Grade points: AA=4.0, BA=3.5, BB=3.0, CB=2.5, CC=2.0, DC=1.5, DD=1.0, FF=0.0
    - Weighted by ECTS credits
  - `getCourseGrades(lectureCode, semester)`: Get all grades for a specific course
  - `getStudentGrades(studentNo)`: Get all grades for a student (sorted by semester)
  - `saveGrades(params)`: Save/update grades for multiple students
    - Validates exam scores (0-100)
    - Calculates letter grades automatically
    - Updates student's `lecture_catalog` if grade is passing (DD or better)
    - Recalculates and updates student GPA
    - Includes timestamps (`entered_at`, `updated_at`)
  - `updateGrade(params)`: Update a single grade (for Head Lecturer override)
    - Can update exam scores or letter grade directly
    - Recalculates GPA after update
  - `getEnrolledStudents(lectureCode, semester)`: Get students enrolled in a course

#### 3. Grade Entry Form Component
- **File**: `components/GradeEntryForm.tsx`
- **Features**:
  - Course and semester selection (only lecturer's own courses)
  - Displays all enrolled students in a table
  - Input fields for each exam type next to each student
  - Shows existing letter grades
  - Validates scores (0-100)
  - Save button with loading state
  - Success/error messages
  - Automatically calculates letter grades on save
- **Access**: Instructors and Presidents
- **Page**: `app/dashboard/grades/page.tsx`

#### 4. Student Transcript View
- **File**: `components/TranscriptView.tsx`
- **Features**:
  - Displays student's complete academic record
  - Grades grouped by semester
  - Shows: Course Code, Course Name, ECTS, Letter Grade
  - Calculates semester GPA for each semester
  - Displays overall GPA
  - Student information header (Student No, Name, Overall GPA)
- **Access**: Students only
- **Page**: `app/dashboard/transcript/page.tsx`

#### 5. Grade Edit Form (Head Lecturer Override)
- **File**: `components/GradeEditForm.tsx`
- **Features**:
  - Select any student from the system
  - View all grades for selected student
  - Edit exam scores or letter grade directly
  - Inline editing with save/cancel buttons
  - Updates GPA automatically after changes
  - Tracks who made the update (`updated_by`)
- **Access**: President (Head Lecturer) only
- **Page**: `app/dashboard/edit-grades/page.tsx`

#### 6. Profile Update Form (Staff)
- **File**: `components/ProfileUpdateForm.tsx`
- **Features**:
  - Update name and email
  - Role display (read-only)
  - Form validation
  - Success/error messages
- **Access**: Staff members only
- **Page**: `app/dashboard/profile-update/page.tsx`

#### 7. Course Schedule View
- **File**: `components/ScheduleView.tsx`
- **Features**:
  - Weekly schedule grid (Monday-Friday, 8:00-19:00)
  - Shows enrolled courses with time slots
  - Parses time format: "Mon 10:00-12:00" or "Monday 10:00-12:00"
  - Visual course blocks in grid cells
  - Displays course code and name
  - Responsive table layout
- **Access**: Students only
- **Page**: `app/dashboard/schedule/page.tsx`

#### 8. Sidebar Menu Updates
- **File**: `components/Sidebar.tsx`
- **New Menu Items Added**:
  - "Grade Entry" - `/dashboard/grades` (instructor, president)
  - "Edit Grades" - `/dashboard/edit-grades` (president only)
  - "Transcript" - `/dashboard/transcript` (student only)
  - "Schedule" - `/dashboard/schedule` (student only)
  - "Update Profile" - `/dashboard/profile-update` (staff only)

---

## Completed Features Summary

### Sprint 3 Tasks ✅
- ✅ Grade Entry Screen (Input fields next to each student)
- ✅ Save Grades operation (Write to database with timestamp)
- ✅ Letter Grade Calculation (Midterm 40% + Final 60% → AA, BA, BB, etc.)
- ✅ Student Transcript Page (Grade list grouped by semesters)
- ✅ GPA Calculation function (4.0 scale, weighted by ECTS)

### Sprint 4 Tasks ✅
- ✅ All students list for Head Lecturer (already implemented in students page)
- ✅ Student Edit Form (Head Lecturer can manually change grades)
- ✅ Profile update screens for Staff
- ✅ Course Schedule viewing (Hourly grid-based layout)
- ✅ UI Polish (Error messages, loading animations throughout)
- ⏳ Project Presentation preparation (Screenshots and Readme.md) - In Progress

---

## Technical Details

### Grade Calculation Logic
- **Letter Grade**: Weighted average of exam scores based on exam percentages
  - Example: Midterm 40% (score: 80) + Final 60% (score: 70) = 74 → CC
- **GPA Calculation**: Weighted average of grade points by ECTS credits
  - Formula: Σ(grade_point × ECTS) / Σ(ECTS)
- **Automatic Updates**: 
  - Letter grades calculated automatically when exam scores are saved
  - GPA recalculated whenever grades are added/updated
  - Student's `lecture_catalog` updated when passing grade (DD or better)

### Database Models
- **Grade**: Stores exam scores, letter grades, and timestamps
- **Student**: Contains `lecture_catalog` (passed courses) and `gpa`
- **Exam**: Defines exam types and percentages for each course

### UI/UX Features
- Loading states on all async operations
- Error messages with clear feedback
- Success confirmations
- Form validation
- Responsive tables
- Search and filter capabilities
- Inline editing where appropriate

---

## Files Created (Session 3)
1. `models/Grade.ts`
2. `actions/gradeActions.ts`
3. `components/GradeEntryForm.tsx`
4. `components/TranscriptView.tsx`
5. `components/GradeEditForm.tsx`
6. `components/ProfileUpdateForm.tsx`
7. `components/ScheduleView.tsx`
8. `app/dashboard/grades/page.tsx`
9. `app/dashboard/transcript/page.tsx`
10. `app/dashboard/edit-grades/page.tsx`
11. `app/dashboard/profile-update/page.tsx`
12. `app/dashboard/schedule/page.tsx`

## Files Modified (Session 3)
1. `components/Sidebar.tsx` - Added new menu items
2. `actions/studentActions.ts` - Already had `getAllStudents()`

---

## Next Steps
- ⏳ Project Presentation preparation (Screenshots and comprehensive README.md)
