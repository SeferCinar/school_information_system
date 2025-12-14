# Sprint 1 Report - School Information System (OBS)

## Overview
This document outlines the tasks completed during Sprint 1, focusing on **Role-Based Authentication** and **Navigation & Layout**.

## Completed Tasks

### 1. Project Setup
- Initialized Next.js project with TypeScript.
- Configured Tailwind CSS for styling.
- Established project folder structure:
  - `/components`: UI components (Sidebar, RoleBasedRoute).
  - `/context`: State management (AuthContext).
  - `/data`: Mock data storage.
  - `/types`: TypeScript interfaces.
  - `/services`: Business logic (AuthService).
  - `/app`: Next.js App Router pages.

### 2. Role-Based Authentication (P1)
- **AuthContext**: Implemented `AuthContext` to manage user session state (login/logout).
- **Mock Data**: Created `users.json` with 4 user roles:
  - Student (`student@school.edu`)
  - Instructor (`instructor@school.edu`)
  - President (`president@school.edu`)
  - Staff (`staff@school.edu`)
- **Login Page**: Built a responsive Login UI at `/login`.
- **Login Logic**: Implemented credentials verification against `users.json`.
- **Role Protection**: Created `RoleBasedRoute` component to restrict access based on user roles.

### 3. Navigation & Layout (P1)
- **Sidebar**: Implemented a responsive Sidebar component.
- **Dynamic Menu**: configured menu items to filter based on the logged-in user's role.
  - *Example*: "Manage Courses" is only visible to President and Instructors.
- **Dashboard Layout**: Created a protected layout that redirects unauthenticated users to Login.

## Technical Details

### Key Files
- `context/AuthContext.tsx`: Manages global user state and localStorage persistence.
- `services/authService.ts`: Handles login logic and data fetching.
- `components/Sidebar.tsx`: Renders navigation based on `user.role`.
- `components/RoleBasedRoute.tsx`: Higher-order component for route protection.

### Usage
1. **Login**: Navigate to `/login` (or root `/`). Use the demo credentials provided on the login page.
2. **Dashboard**: Upon login, user is redirected to `/dashboard`.
3. **Role Check**:
   - Log in as **Student** -> See limited menu.
   - Log in as **President** -> See "Manage Courses" in sidebar.
   - Try accessing protected route directly -> Redirected to `/unauthorized` or `/login`.

## Next Steps (Sprint 2)
- Course Management (CRUD).
- Student Course Selection.
- Business Rules implementation.

