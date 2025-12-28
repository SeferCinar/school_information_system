# Sprint 2 Report

## Completed Tasks

### 1. Course Management (Head Lecturer / Instructors)
- **Course Listing Table**: Implemented a comprehensive table view for courses with:
  - **Search**: Real-time search by course name or code.
  - **Filtering**: Filter by Department and Semester.
  - **Display**: Shows Code, Name, Department, ECTS, Quota, and Semester.
- **Add Course Form**: created a form for adding new courses to the system.
  - Restricted to authorized roles (President/Head Lecturer, Instructor).
  - Fields: Code, Name, Department, Semester, ECTS, Quota, Prerequisites.
  - **Auto-ID**: Uses Course Code as the unique identifier.
  - **Prerequisites**: Supports comma-separated input for prerequisite course codes.

### 2. Student Course Selection
- **Course Selection Screen**: A dedicated dashboard page for students to manage enrollments.
- **Features**:
  - **Available Courses**: List of all courses with search functionality.
  - **Cart System**: Students can add courses to a temporary "cart" before finalizing.
  - **Visual Feedback**:
    - Highlights already enrolled courses.
    - Indicates if a course is in the cart.
    - Shows "Full" if quota is reached.
    - Warnings for prerequisite issues.

### 3. Business Logic & Validations
- **ECTS Credit Check**: 
  - Prevents adding courses if the total ECTS (enrolled + cart) exceeds **45**.
  - Displays a running total of ECTS credits.
- **Quota Check**:
  - **Real-time**: Checks current enrollment count against course quota.
  - ** Enforcement**: Prevents enrollment if the quota is full.
- **Prerequisite Check**:
  - Verifies if the student has passed the required prerequisite courses (based on `lecture_catalog` history).
  - Displays warnings and prevents adding to cart if prerequisites are missing.

### 4. Technical Implementation
- **Server Actions**: Implemented secure Next.js Server Actions for database operations:
  - `getCourses`: Optimized with Aggregation Pipeline to include real-time enrollment counts.
  - `addCourse`: Handles course creation.
  - `getStudent`: Fetches student data including history.
  - `enrollStudent`: Transaction-like handling of final enrollment, including all server-side validation checks (Double verification).
- **Database**:
  - Updated `Student` model to include `enrolledCourses`.
  - Used `Enrolment` collection for normalized enrollment records.
  - Utilized MongoDB Aggregations for efficient data retrieval.

## Design
- Maintained consistency with the existing dashboard layout using Tailwind CSS.
- Responsive design for tables and forms.
- Clear error and success messages for user feedback.

