# Student Information System (OBS)

A comprehensive web-based Student Information System built with Next.js, MongoDB, and TypeScript. This system manages course enrollment, exam scheduling, grade entry, and academic records for students, lecturers, and administrative staff.

## 🎯 Project Overview

This is a role-based academic management system that supports four user roles:
- **Student**: Enroll in courses, view exams, check transcripts and schedules
- **Instructor/Lecturer**: Create exams, enter grades, view enrolled students
- **President/Head Lecturer**: Full administrative access including grade overrides
- **Staff**: View students and update profile information

## 🚀 Features

### Authentication & Authorization
- Role-based authentication system
- Protected routes based on user roles
- Session management with localStorage

### Course Management
- Course CRUD operations (Head Lecturer)
- Course listing with search and filters
- Course selection for students with business rule validation:
  - Credit limit check (max 45 ECTS)
  - Quota validation
  - Prerequisite verification

### Exam Management
- Create exams with type, percentage, date, time, and duration
- View exams for enrolled/taught courses
- Exam list with course details and time information

### Grade Management
- Grade entry form for lecturers
- Automatic letter grade calculation (AA, BA, BB, CB, CC, DC, DD, FF)
- GPA calculation (4.0 scale, weighted by ECTS)
- Grade override capability for Head Lecturer
- Timestamp tracking for all grade operations

### Academic Records
- Student transcript view (grouped by semesters)
- Semester and overall GPA calculation
- Course schedule viewing (weekly grid layout)

### User Management
- Profile viewing for all users
- Student details for students
- Profile update for staff members
- Student list for instructors and administrators

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom AuthContext with role-based access
- **State Management**: React Context API

## 📁 Project Structure

```
school_information_system/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
├── models/               # MongoDB Mongoose models
├── actions/              # Server actions
├── context/              # React context providers
├── services/             # Business logic services
├── lib/                  # Utility functions
└── types/                # TypeScript type definitions
```

## 🗄️ Database Models

- **User**: Authentication and role information
- **Student**: Student records with enrolled courses and GPA
- **Lecturer**: Academic staff information
- **Staff_Member**: Administrative staff
- **Lecture**: Course information
- **Enrolment**: Student-course enrollment records
- **Exam**: Exam definitions with time and duration
- **Grade**: Student grades with exam scores and letter grades

## 🔐 User Roles & Permissions

### Student
- View enrolled courses
- Select courses (with validation)
- View exams for enrolled courses
- View transcript and GPA
- View weekly schedule

### Instructor/Lecturer
- View taught courses
- Create exams
- Enter grades for enrolled students
- View exams for taught courses

### President/Head Lecturer
- All instructor permissions
- Create and manage courses
- Edit any student's grades (override)
- View all students
- Full system access

### Staff
- View all students
- Update own profile
- View profile information

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd school_information_system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file:
```env
MONGODB_URL=mongodb://localhost:27017/SIS_DB
MONGODB_URL=mongodb://localhost:27017/SIS_DB
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Business Rules

### Course Selection
- Maximum 45 ECTS credits per semester
- Cannot exceed course quota
- Must have passed prerequisite courses
- Prerequisites checked against `lecture_catalog`

### Grade Calculation
- Letter grades calculated from weighted exam scores
- Exam percentages can be customized (e.g., Midterm 40%, Final 60%)
- GPA calculated on 4.0 scale:
  - AA = 4.0, BA = 3.5, BB = 3.0, CB = 2.5, CC = 2.0, DC = 1.5, DD = 1.0, FF = 0.0
- Passing grades (DD or better) automatically added to `lecture_catalog`

### Exam Management
- Each exam must have unique type per course/semester
- Total exam percentages can exceed 100% (warning shown)
- Exam dates must be in the future
- Time and duration required for scheduling

## 🎨 UI Features

- Responsive design with Tailwind CSS
- Loading states for async operations
- Error messages with clear feedback
- Search and filter capabilities
- Inline editing where appropriate
- Role-based navigation sidebar

## 📚 Key Pages

- `/login` - User authentication
- `/dashboard` - Main dashboard
- `/dashboard/courses` - My Courses (students/instructors)
- `/dashboard/course-selection` - Course enrollment (students)
- `/dashboard/manage-courses` - Course management (instructors/presidents)
- `/dashboard/exams` - Exam creation (instructors/presidents)
- `/dashboard/exams-list` - View exams (students/instructors/presidents)
- `/dashboard/grades` - Grade entry (instructors/presidents)
- `/dashboard/edit-grades` - Grade override (presidents only)
- `/dashboard/transcript` - Academic transcript (students)
- `/dashboard/schedule` - Weekly schedule (students)
- `/dashboard/students` - Student list (instructors/presidents/staff)
- `/dashboard/profile` - User profile
- `/dashboard/profile-update` - Profile update (staff)

## 🔧 Development

### Server Actions
All database operations are implemented as Next.js server actions in the `actions/` directory:
- `authActions.ts` - Authentication
- `courseActions.ts` - Course management
- `studentActions.ts` - Student operations
- `examActions.ts` - Exam management
- `gradeActions.ts` - Grade operations

### Models
MongoDB models are defined in `models/` using Mongoose schemas.

## 📄 License

This project is part of an academic assignment.

## 👥 Authors

- Sefer Çınar (231805048)
- İpek Nezihe Can (241805122)
- Refia Nur Şenyiğit (231805065)

## 📖 Documentation

For detailed development logs, see:
- `SPRINT_1.md` - Sprint 1 development log
- `SPRINT_2.md` - Sprint 2 development log
- `SPRINT_3.md` - Sprint 3 development log

---

**Note**: This is an academic project. Ensure MongoDB is running and properly configured before starting the application.
