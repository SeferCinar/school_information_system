"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

type MenuItem = {
  label: string;
  href: string;
  roles: Role[];
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['student', 'instructor', 'president', 'staff'] },
  { label: 'My Courses', href: '/dashboard/courses', roles: ['student', 'instructor'] },
  { label: 'Course Selection', href: '/dashboard/course-selection', roles: ['student'] },
  { label: 'Manage Courses', href: '/dashboard/manage-courses', roles: ['president', 'instructor'] },
  { label: 'Exam Creation', href: '/dashboard/exams', roles: ['instructor', 'president'] },
  { label: 'My Exams', href: '/dashboard/exams-list', roles: ['student', 'instructor', 'president'] },
  { label: 'Grade Entry', href: '/dashboard/grades', roles: ['instructor', 'president'] },
  { label: 'Edit Grades', href: '/dashboard/edit-grades', roles: ['president'] },
  { label: 'Transcript', href: '/dashboard/transcript', roles: ['student'] },
  { label: 'Schedule', href: '/dashboard/schedule', roles: ['student'] },
  { label: 'Students', href: '/dashboard/students', roles: ['instructor', 'president', 'staff'] },
  { label: 'Profile', href: '/dashboard/profile', roles: ['student', 'instructor', 'president', 'staff'] },
  { label: 'Update Profile', href: '/dashboard/profile-update', roles: ['staff'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        OBS System
      </div>
      <div className="p-6 border-b border-gray-700">
        <p className="text-sm text-gray-400">Welcome,</p>
        <p className="font-semibold truncate">{user.name}</p>
        <p className="text-xs text-gray-500 uppercase mt-1">{user.role}</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={logout} className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}

